import { Router, Response } from 'express';
import { CatalogService } from '../services/catalog.service.js';
import {
  authenticateJwt,
  requireRole,
  resolveCampusContext,
} from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';
import { db } from '../services/store.js';

export const productRouter = Router();

// GET /api/v1/products (Scoped to active campus)
productRouter.get('/', resolveCampusContext, (req: AuthenticatedRequest, res: Response): void => {
  const { category, search, minPrice, maxPrice, hostelName, condition, vendorId, includeInactive } = req.query;

  const products = CatalogService.listProducts({
    campusId: req.campusId!,
    category: category as string,
    search: search as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    hostelName: hostelName as string,
    condition: condition as string,
    vendorId: vendorId as string,
    includeInactive: includeInactive === 'true',
  });

  res.status(200).json({
    success: true,
    campusId: req.campusId,
    count: products.length,
    data: products,
  });
});

// GET /api/v1/products/:id
productRouter.get('/:id', (req, res): void => {
  const product = CatalogService.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'ProductNotFound', message: 'Product listing not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// POST /api/v1/products (Vendor only listing creation)
productRouter.post(
  '/',
  authenticateJwt,
  requireRole('vendor'),
  resolveCampusContext,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      if (!vendor) {
        res.status(400).json({
          error: 'VendorProfileMissing',
          message: 'Active vendor profile required to create listing',
        });
        return;
      }

      const {
        title,
        description,
        category,
        condition,
        price,
        compareAtPrice,
        images,
        stockQuantity,
        hostelName,
        sizeBadge,
        comboBadge,
      } = req.body;

      if (!title || !description || !category || !condition || !price) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'title, description, category, condition, and price are required',
        });
        return;
      }

      const newProduct = CatalogService.createProduct({
        campusId: req.campusId!,
        vendorId: vendor.id,
        title,
        description,
        category,
        condition,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        images: Array.isArray(images) ? images : [],
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity, 10) : 1,
        hostelName: hostelName ? String(hostelName) : undefined,
        sizeBadge: sizeBadge ? String(sizeBadge) : undefined,
        comboBadge: comboBadge ? String(comboBadge) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Product listed successfully on campus marketplace',
        data: newProduct,
      });
    } catch (err: any) {
      res.status(400).json({ error: 'CreateProductFailed', message: err.message });
    }
  }
);

// PATCH /api/v1/products/:id (Vendor update product listing / stock)
productRouter.patch(
  '/:id',
  authenticateJwt,
  requireRole('vendor', 'admin'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const productId = req.params.id as string;
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      const product = db.products.find((p) => p.id === productId);
      if (!product) {
        res.status(404).json({ error: 'ProductNotFound', message: 'Product listing not found' });
        return;
      }

      if (product.vendorId !== vendor?.id && !req.user!.roles.includes('admin')) {
        res.status(403).json({ error: 'Forbidden', message: 'Cannot edit product belonging to another vendor' });
        return;
      }

      const updated = CatalogService.updateProduct(productId, {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        condition: req.body.condition,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : undefined,
        compareAtPrice: req.body.compareAtPrice !== undefined ? parseFloat(req.body.compareAtPrice) : undefined,
        stockQuantity: req.body.stockQuantity !== undefined ? parseInt(req.body.stockQuantity, 10) : undefined,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : undefined,
        hostelName: req.body.hostelName,
        images: Array.isArray(req.body.images) ? req.body.images : undefined,
        sizeBadge: req.body.sizeBadge !== undefined ? String(req.body.sizeBadge) : undefined,
        comboBadge: req.body.comboBadge !== undefined ? String(req.body.comboBadge) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (err: any) {
      res.status(400).json({ error: 'UpdateFailed', message: err.message });
    }
  }
);

// POST /api/v1/products/:id/toggle-stock (Vendor quick stock availability toggle)
productRouter.post(
  '/:id/toggle-stock',
  authenticateJwt,
  requireRole('vendor', 'admin'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const productId = req.params.id as string;
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      const product = db.products.find((p) => p.id === productId);
      if (!product) {
        res.status(404).json({ error: 'ProductNotFound', message: 'Product listing not found' });
        return;
      }

      if (product.vendorId !== vendor?.id && !req.user!.roles.includes('admin')) {
        res.status(403).json({ error: 'Forbidden', message: 'Cannot edit product belonging to another vendor' });
        return;
      }

      const toggled = CatalogService.toggleStockAvailability(productId);

      res.status(200).json({
        success: true,
        message: toggled.isActive && toggled.stockQuantity > 0 ? 'Product marked in-stock' : 'Product marked out-of-stock',
        data: toggled,
      });
    } catch (err: any) {
      res.status(400).json({ error: 'ToggleStockFailed', message: err.message });
    }
  }
);

// DELETE /api/v1/products/:id (Vendor remove product listing)
productRouter.delete(
  '/:id',
  authenticateJwt,
  requireRole('vendor', 'admin'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const productId = req.params.id as string;
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      const product = db.products.find((p) => p.id === productId);
      if (!product) {
        res.status(404).json({ error: 'ProductNotFound', message: 'Product listing not found' });
        return;
      }

      if (product.vendorId !== vendor?.id && !req.user!.roles.includes('admin')) {
        res.status(403).json({ error: 'Forbidden', message: 'Cannot delete product belonging to another vendor' });
        return;
      }

      const deleted = CatalogService.deleteProduct(productId);

      res.status(200).json({
        success: true,
        message: 'Product listing removed',
        data: deleted,
      });
    } catch (err: any) {
      res.status(400).json({ error: 'DeleteProductFailed', message: err.message });
    }
  }
);
