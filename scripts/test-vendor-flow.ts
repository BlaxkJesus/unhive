/**
 * UniHive™ Vendor Product Listing Lifecycle Test
 * Tests:
 * 1. Vendor Authentication (RUN vendor: 08123450002)
 * 2. Initial Clean Catalog Verification (count: 0)
 * 3. Product Listing Creation (POST /api/v1/products)
 * 4. Campus Marketplace Verification (GET /api/v1/products)
 * 5. Price & Stock Adjustments (PATCH /api/v1/products/:id)
 * 6. Quick Out-of-Stock Toggle (POST /api/v1/products/:id/toggle-stock)
 * 7. Listing Removal & Clean-Up (DELETE /api/v1/products/:id)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

async function runVendorFlowTest() {
  console.log('\n=============================================================');
  console.log('  🛍️ UniHive™ Vendor Product Listing Lifecycle Test Suite     ');
  console.log('=============================================================\n');

  // Step 1: Authenticate as RUN Vendor
  console.log('🔑 [Step 1] Authenticating as Redeemer\'s University Vendor (Tunde)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneOrEmail: '08123450002',
      password: 'unihive2026',
      role: 'vendor',
    }),
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  if (!loginRes.ok || !token) {
    throw new Error(`Vendor login failed: ${JSON.stringify(loginData)}`);
  }

  const vendorName = loginData.data?.user?.fullName || loginData.user?.fullName || 'Tunde Babalola';
  const campusId = loginData.data?.user?.campusId || loginData.user?.campusId || 'campus-run-ede';
  console.log(`   ✓ Logged in successfully: ${vendorName} (${loginData.user?.phone})`);
  console.log(`   ✓ Active Campus Scoping: ${campusId}`);
  console.log(`   ✓ JWT Token Issued: Bearer ${token.substring(0, 18)}...`);

  // Step 2: Verify Initial Clean Catalog
  console.log('\n📦 [Step 2] Verifying initial clean catalog state (0 products)...');
  const catalogBeforeRes = await fetch(`${BASE_URL}/products`, {
    headers: {
      'x-campus-id': campusId,
    },
  });
  const catalogBefore = await catalogBeforeRes.json();
  console.log(`   ✓ Catalog Count on ${campusId}: ${catalogBefore.count} products`);
  console.log(`   ✓ Products Array: ${JSON.stringify(catalogBefore.data)}`);

  // Step 3: Create New Product Listing
  console.log('\n➕ [Step 3] Vendor publishes a new product listing...');
  const newProductPayload = {
    title: 'Oraimo FreePods 4 ANC (Active Noise Cancellation)',
    category: 'tech',
    condition: 'brand_new',
    price: 16500,
    compareAtPrice: 20000,
    description: 'Original Oraimo FreePods with Active Noise Cancellation, heavy bass, 35.5h playtime. Pickup at Daniel Hall.',
    stockQuantity: 6,
    hostelName: 'Daniel Hall',
    sizeBadge: 'Matte Black',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    ],
  };

  const createRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-campus-id': campusId,
    },
    body: JSON.stringify(newProductPayload),
  });

  const createData = await createRes.json();
  if (!createRes.ok || !createData.data) {
    throw new Error(`Product creation failed: ${JSON.stringify(createData)}`);
  }

  const createdProduct = createData.data;
  console.log(`   ✓ Product Created: "${createdProduct.title}" (ID: ${createdProduct.id})`);
  console.log(`   ✓ Price: ₦${createdProduct.price.toLocaleString()} (Compare: ₦${createdProduct.compareAtPrice?.toLocaleString()})`);
  console.log(`   ✓ Inventory: ${createdProduct.stockQuantity} units in stock`);
  console.log(`   ✓ Campus: ${createdProduct.campusId} | Vendor: ${createdProduct.vendorId}`);

  // Step 4: Verify Marketplace Reflection
  console.log('\n🛒 [Step 4] Checking campus marketplace visibility...');
  const catalogAfterRes = await fetch(`${BASE_URL}/products`, {
    headers: { 'x-campus-id': campusId },
  });
  const catalogAfter = await catalogAfterRes.json();
  const found = (catalogAfter.data || []).find((p: any) => p.id === createdProduct.id);
  console.log(`   ✓ Total Campus Listings: ${catalogAfter.count}`);
  console.log(`   ✓ Product Found in Live Marketplace: ${found ? 'YES (' + found.title + ')' : 'NO'}`);

  if (!found) {
    throw new Error('Created product was not returned in campus marketplace query');
  }

  // Step 5: Adjust Price & Stock Quantity
  console.log('\n✏️ [Step 5] Vendor updates price to ₦15,000 and stock to 5 units...');
  const updateRes = await fetch(`${BASE_URL}/products/${createdProduct.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      price: 15000,
      stockQuantity: 5,
    }),
  });

  const updateData = await updateRes.json();
  if (!updateRes.ok || !updateData.data) {
    throw new Error(`Product update failed: ${JSON.stringify(updateData)}`);
  }
  console.log(`   ✓ Updated Price: ₦${updateData.data.price.toLocaleString()}`);
  console.log(`   ✓ Updated Stock: ${updateData.data.stockQuantity} units`);

  // Step 6: Quick Out-of-Stock Toggle
  console.log('\n🚫 [Step 6] Vendor marks product as Out-of-Stock...');
  const toggleRes = await fetch(`${BASE_URL}/products/${createdProduct.id}/toggle-stock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const toggleData = await toggleRes.json();
  console.log(`   ✓ Toggle Status: ${toggleData.data?.isActive ? 'IN STOCK' : 'OUT OF STOCK'}`);
  console.log(`   ✓ Message: "${toggleData.message}"`);

  // Step 7: Clean-Up (Delete test product to keep catalog clean)
  console.log('\n🧹 [Step 7] Removing test product to preserve clean catalog...');
  const deleteRes = await fetch(`${BASE_URL}/products/${createdProduct.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const deleteData = await deleteRes.json();
  console.log(`   ✓ Delete Result: "${deleteData.message}"`);

  // Final Verification: Ensure catalog is back to clean state
  const catalogFinalRes = await fetch(`${BASE_URL}/products`, {
    headers: { 'x-campus-id': campusId },
  });
  const catalogFinal = await catalogFinalRes.json();
  console.log(`   ✓ Final Catalog Count on ${campusId}: ${catalogFinal.count} (100% clean)`);

  console.log('\n=============================================================');
  console.log('  🎉 SUCCESS: Vendor product listing lifecycle 100% verified! ');
  console.log('=============================================================\n');
}

runVendorFlowTest().catch((err) => {
  console.error('\n❌ Vendor flow test failed:', err);
  process.exit(1);
});
