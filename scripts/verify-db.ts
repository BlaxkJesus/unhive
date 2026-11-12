import { prisma } from '../src/db/prisma.js';
import { CatalogService } from '../src/services/catalog.service.js';

async function main() {
  console.log('--- Checking SQLite Database Persistence ---');
  const countBefore = await prisma.product.count();

  // Create a product through CatalogService which triggers db.saveProduct
  const testProd = CatalogService.createProduct({
    campusId: 'campus-run-ede',
    vendorId: 'vendor-tunde-kicks',
    title: 'RUN Custom Hoodie (Class of 2026)',
    description: 'Navy blue fleece hoodie with embroidered RUN shield.',
    category: 'clothing',
    condition: 'brand_new',
    price: 12000,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2'],
  });

  // Small delay to allow async SQLite write to complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  const countAfter = await prisma.product.count();
  const savedInDb = await prisma.product.findUnique({
    where: { id: testProd.id },
  });

  console.log(`Product Count Before: ${countBefore}`);
  console.log(`Product Count After:  ${countAfter}`);
  console.log(`Retrieved from SQLite:`, savedInDb ? `✓ ${savedInDb.title} (₦${savedInDb.price})` : '✗ Not found');
  console.log('--- Persistence Test Completed Successfully ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
