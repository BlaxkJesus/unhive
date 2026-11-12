import { db, ProductEntity } from './store.js';

export class CatalogService {
  static listProducts(params: {
    campusId: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    hostelName?: string;
    condition?: string;
    vendorId?: string;
    includeInactive?: boolean;
  }) {
    let results = db.products.filter((p) => p.campusId === params.campusId);

    // If not explicitly asking for inactive/archived products,
    // include active items AND items marked out-of-stock (stockQuantity === 0)
    // so buyers can see sold-out listings with out-of-stock badges.
    if (!params.includeInactive) {
      results = results.filter((p) => p.isActive || p.stockQuantity === 0);
    }

    if (params.vendorId) {
      results = results.filter((p) => p.vendorId === params.vendorId);
    }

    if (params.category && params.category !== 'all') {
      results = results.filter(
        (p) => p.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.condition && params.condition !== 'all') {
      results = results.filter(
        (p) => p.condition.toLowerCase() === params.condition?.toLowerCase()
      );
    }

    if (params.hostelName && params.hostelName !== 'all') {
      const h = params.hostelName.toLowerCase();
      results = results.filter(
        (p) => p.hostelName && p.hostelName.toLowerCase().includes(h)
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (params.minPrice !== undefined) {
      results = results.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= params.maxPrice!);
    }

    return results.map((product) => {
      const vendor = db.vendorProfiles.find((v) => v.id === product.vendorId);
      return {
        ...product,
        vendor: vendor
          ? {
              id: vendor.id,
              businessName: vendor.businessName,
              trustScore: vendor.trustScore,
              completedOrdersCount: vendor.completedOrdersCount,
            }
          : null,
      };
    });
  }

  static getProductById(productId: string) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      return null;
    }

    const vendor = db.vendorProfiles.find((v) => v.id === product.vendorId);
    const campus = db.campuses.find((c) => c.id === product.campusId);

    return {
      ...product,
      vendor: vendor
        ? {
            id: vendor.id,
            businessName: vendor.businessName,
            description: vendor.description,
            trustScore: vendor.trustScore,
            completedOrdersCount: vendor.completedOrdersCount,
          }
        : null,
      campus: campus
        ? {
            id: campus.id,
            name: campus.name,
            shortName: campus.shortName,
          }
        : null,
    };
  }

  static createProduct(params: {
    campusId: string;
    vendorId: string;
    title: string;
    description: string;
    category: string;
    condition: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    stockQuantity?: number;
    hostelName?: string;
    sizeBadge?: string;
    comboBadge?: string;
  }) {
    const vendor = db.vendorProfiles.find((v) => v.id === params.vendorId);
    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    const stock = params.stockQuantity !== undefined ? params.stockQuantity : 1;
    const newProduct: ProductEntity = {
      id: `prod-${Date.now()}`,
      campusId: params.campusId,
      vendorId: params.vendorId,
      title: params.title,
      description: params.description,
      category: params.category,
      condition: params.condition,
      price: params.price,
      compareAtPrice: params.compareAtPrice,
      images: params.images && params.images.length > 0 ? params.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
      stockQuantity: Math.max(0, stock),
      isActive: stock > 0,
      hostelName: params.hostelName || 'Queen Esther Hall',
      sizeBadge: params.sizeBadge,
      comboBadge: params.comboBadge,
      createdAt: new Date(),
    };

    db.products.unshift(newProduct);
    db.saveProduct(newProduct);
    return newProduct;
  }

  static updateProduct(productId: string, updates: Partial<ProductEntity>) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (updates.title !== undefined) product.title = updates.title;
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.category !== undefined) product.category = updates.category;
    if (updates.condition !== undefined) product.condition = updates.condition;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.compareAtPrice !== undefined) product.compareAtPrice = updates.compareAtPrice;
    if (updates.hostelName !== undefined) product.hostelName = updates.hostelName;
    if (updates.images !== undefined) product.images = updates.images;
    if (updates.sizeBadge !== undefined) product.sizeBadge = updates.sizeBadge;
    if (updates.comboBadge !== undefined) product.comboBadge = updates.comboBadge;

    if (updates.stockQuantity !== undefined) {
      product.stockQuantity = Math.max(0, updates.stockQuantity);
      if (product.stockQuantity === 0) {
        product.isActive = false;
      } else {
        product.isActive = true;
      }
    }

    if (updates.isActive !== undefined) {
      product.isActive = updates.isActive;
      if (!updates.isActive && product.stockQuantity > 0) {
        // Kept for consistency if vendor explicitly marks inactive
      }
    }

    db.saveProduct(product);
    return product;
  }

  static toggleStockAvailability(productId: string) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // If in stock, toggle to out of stock
    if (product.isActive && product.stockQuantity > 0) {
      product.stockQuantity = 0;
      product.isActive = false;
    } else {
      // Restore to in-stock with default 5 units or previous count
      product.stockQuantity = product.stockQuantity > 0 ? product.stockQuantity : 5;
      product.isActive = true;
    }

    db.saveProduct(product);
    return product;
  }

  static deleteProduct(productId: string) {
    const index = db.products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error('Product not found');
    }
    const deleted = db.products.splice(index, 1)[0];
    return deleted;
  }
}
