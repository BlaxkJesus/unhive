/**
 * UniHive™ Database Seeding Script (Ajayi Crowther University Flagship Launch)
 * Populates SQLite (file:./dev.db) with campuses, hostels, users, profiles, products & active demo orders.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/db/prisma.js';

export async function seedDatabase() {
  console.log('🌱 [Prisma] Starting UniHive Database Seeding for ACU Flagship...');

  // 1. Campuses (Flagship: Redeemer's University, Ede)
  const campuses = [
    {
      id: 'campus-run-ede',
      slug: 'run-ede',
      name: "Redeemer's University",
      shortName: 'RUN',
      city: 'Ede',
      state: 'Osun State',
      status: 'active',
      currency: 'NGN',
    },
    {
      id: 'campus-acu-oyo',
      slug: 'acu-oyo',
      name: 'Ajayi Crowther University',
      shortName: 'ACU',
      city: 'Oyo',
      state: 'Oyo State',
      status: 'active',
      currency: 'NGN',
    },
    {
      id: 'campus-bowen-iwo',
      slug: 'bowen-iwo',
      name: 'Bowen University',
      shortName: 'Bowen',
      city: 'Iwo',
      state: 'Osun State',
      status: 'waitlist',
      currency: 'NGN',
    },
    {
      id: 'campus-babcock-ilishan',
      slug: 'babcock-ilishan',
      name: 'Babcock University',
      shortName: 'Babcock',
      city: 'Ilishan-Remo',
      state: 'Ogun State',
      status: 'waitlist',
      currency: 'NGN',
    },
    {
      id: 'campus-abuad-ado',
      slug: 'abuad-ado',
      name: 'Afe Babalola University (ABUAD)',
      shortName: 'ABUAD',
      city: 'Ado-Ekiti',
      state: 'Ekiti State',
      status: 'waitlist',
      currency: 'NGN',
    },
    {
      id: 'campus-pau-lagos',
      slug: 'pau-lagos',
      name: 'Pan-Atlantic University',
      shortName: 'PAU',
      city: 'Ibeju-Lekki',
      state: 'Lagos State',
      status: 'waitlist',
      currency: 'NGN',
    },
  ];

  for (const c of campuses) {
    await prisma.campus.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Seeded ${campuses.length} Campuses (Flagship: Redeemer's University, Ede)`);

  // 2. Hostels with Ground-Floor Porter Lodges
  const hostels = [
    // Redeemer's University Hostels
    {
      id: 'hostel-run-queen-esther',
      campusId: 'campus-run-ede',
      name: 'Queen Esther Hall',
      gender: 'female',
      porterLodgeName: 'Queen Esther Ground Floor Porter Reception',
      porterPhone: '08031234567',
      isActive: true,
    },
    {
      id: 'hostel-run-deborah',
      campusId: 'campus-run-ede',
      name: 'Deborah Hall',
      gender: 'female',
      porterLodgeName: 'Deborah Ground Floor Porter Reception',
      porterPhone: '08031234568',
      isActive: true,
    },
    {
      id: 'hostel-run-daniel',
      campusId: 'campus-run-ede',
      name: 'Daniel Hall',
      gender: 'male',
      porterLodgeName: 'Daniel Security & Porter Desk',
      porterPhone: '08037654321',
      isActive: true,
    },
    {
      id: 'hostel-run-joseph',
      campusId: 'campus-run-ede',
      name: 'Joseph Hall',
      gender: 'male',
      porterLodgeName: 'Joseph Security & Porter Desk',
      porterPhone: '08037654322',
      isActive: true,
    },
    // ACU Hostels
    {
      id: 'hostel-acu-oyinlola',
      campusId: 'campus-acu-oyo',
      name: 'Lady Oyinlola Hall',
      gender: 'female',
      porterLodgeName: 'Lady Oyinlola Ground Floor Porter Reception',
      porterPhone: '08031234567',
      isActive: true,
    },
    {
      id: 'hostel-acu-akinola',
      campusId: 'campus-acu-oyo',
      name: 'Peter Akinola Hall',
      gender: 'male',
      porterLodgeName: 'Peter Akinola Security & Porter Desk',
      porterPhone: '08037654321',
      isActive: true,
    },
    {
      id: 'hostel-acu-crowther',
      campusId: 'campus-acu-oyo',
      name: 'Bishop Crowther Hall',
      gender: 'male',
      porterLodgeName: 'Bishop Crowther Central Porter Office',
      porterPhone: '08039988776',
      isActive: true,
    },
  ];

  for (const h of hostels) {
    await prisma.hostel.upsert({
      where: { id: h.id },
      update: h,
      create: h,
    });
  }
  console.log(`✓ Seeded ${hostels.length} ACU Ground-Floor Porter Lodges`);

  // Default password hash for "unihive2026"
  const passwordHash = await bcrypt.hash('unihive2026', 8);

  // 3. Pre-provisioned Seed Users (RUN Flagship & ACU)
  const users = [
    // Redeemer's University Users (Flagship)
    {
      id: 'user-run-buyer-1',
      campusId: 'campus-run-ede',
      fullName: 'Folake Adebayo',
      email: 'buyer@run.edu.ng',
      phone: '08123450001',
      matricNumber: 'RUN/2023/CMP/084',
      hostelId: 'hostel-run-queen-esther',
      roomNumber: 'Room 204',
      passwordHash,
      roles: JSON.stringify(['buyer']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
    },
    {
      id: 'user-run-vendor-1',
      campusId: 'campus-run-ede',
      fullName: 'Tunde Babalola',
      email: 'vendor@run.edu.ng',
      phone: '08123450002',
      matricNumber: 'RUN/2022/ECN/102',
      hostelId: 'hostel-run-daniel',
      roomNumber: 'Room 112',
      passwordHash,
      roles: JSON.stringify(['buyer', 'vendor']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
    },
    {
      id: 'user-run-courier-1',
      campusId: 'campus-run-ede',
      fullName: 'David Adeleke',
      email: 'courier@run.edu.ng',
      phone: '08123450003',
      matricNumber: 'RUN/2023/LAW/054',
      hostelId: 'hostel-run-daniel',
      roomNumber: 'Room 305',
      passwordHash,
      roles: JSON.stringify(['buyer', 'courier']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
    },
    {
      id: 'user-run-admin-1',
      campusId: 'campus-run-ede',
      fullName: 'Chief Proctor O. Adeleke',
      email: 'admin@run.edu.ng',
      phone: '08123450004',
      matricNumber: 'STAFF/RUN/SEC/001',
      passwordHash,
      roles: JSON.stringify(['admin']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      twoFactorEnabled: true,
    },
    // ACU Users
    {
      id: 'user-acu-buyer-1',
      campusId: 'campus-acu-oyo',
      fullName: 'Folake Adebayo',
      email: 'buyer@unihive.edu.ng',
      phone: '08143829102',
      matricNumber: 'ACU/2023/CMP/084',
      hostelId: 'hostel-acu-oyinlola',
      roomNumber: 'Room 204',
      passwordHash,
      roles: JSON.stringify(['buyer']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
    },
    {
      id: 'user-acu-vendor-1',
      campusId: 'campus-acu-oyo',
      fullName: 'Tunde Babalola',
      email: 'vendor@unihive.edu.ng',
      phone: '08023456789',
      matricNumber: 'ACU/2022/ECN/102',
      hostelId: 'hostel-acu-akinola',
      roomNumber: 'Room 112',
      passwordHash,
      roles: JSON.stringify(['buyer', 'vendor']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
    },
    {
      id: 'user-acu-courier-1',
      campusId: 'campus-acu-oyo',
      fullName: 'David Adeleke',
      email: 'courier@unihive.edu.ng',
      phone: '08098765432',
      matricNumber: 'ACU/2023/LAW/054',
      hostelId: 'hostel-acu-akinola',
      roomNumber: 'Room 305',
      passwordHash,
      roles: JSON.stringify(['buyer', 'courier']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
    },
    {
      id: 'user-acu-admin-1',
      campusId: 'campus-acu-oyo',
      fullName: 'Chief Proctor O. Adeleke',
      email: 'admin@unihive.edu.ng',
      phone: '08000000001',
      matricNumber: 'STAFF/ACU/SEC/001',
      passwordHash,
      roles: JSON.stringify(['admin']),
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      twoFactorEnabled: true,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });
  }
  console.log(`✓ Seeded ${users.length} Role-Based Verified Users (RUN & ACU)`);

  // 4. Vendor Profiles (RUN Flagship & ACU)
  const vendorProfiles = [
    {
      id: 'vendor-run-tunde-kicks',
      userId: 'user-run-vendor-1',
      campusId: 'campus-run-ede',
      businessName: 'RUN Kicks & Thrift',
      description: 'Quality sneakers, slides & vintage jerseys delivered to RUN hostel ground-floor porters.',
      bankName: 'OPay',
      accountNumber: '8123450002',
      accountName: 'Tunde Babalola RUN Kicks',
      paystackSubaccountCode: 'ACCT_runkicks99',
      trustScore: 4.98,
      completedOrdersCount: 68,
      isApproved: true,
    },
    {
      id: 'vendor-tunde-kicks',
      userId: 'user-acu-vendor-1',
      campusId: 'campus-acu-oyo',
      businessName: 'Tunde Kicks & Thrift',
      description: 'Quality sneakers, slides & vintage jerseys delivered to your hostel.',
      bankName: 'OPay',
      accountNumber: '8023456789',
      accountName: 'Tunde Babalola Kicks',
      paystackSubaccountCode: 'ACCT_tundekicks99',
      trustScore: 4.95,
      completedOrdersCount: 42,
      isApproved: true,
    },
  ];

  for (const vp of vendorProfiles) {
    await prisma.vendorProfile.upsert({
      where: { id: vp.id },
      update: vp,
      create: vp,
    });
  }
  console.log(`✓ Seeded ${vendorProfiles.length} Vendor Profiles`);

  // 5. Courier Profiles (RUN Flagship & ACU)
  const courierProfiles = [
    {
      id: 'courier-run-david',
      userId: 'user-run-courier-1',
      campusId: 'campus-run-ede',
      matricNumber: 'RUN/2023/LAW/054',
      studentIdUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
      baseHostelId: 'hostel-run-daniel',
      status: 'available',
      bankName: 'Kuda Bank',
      accountNumber: '2019283747',
      accountName: 'David Adeleke RUN Dispatch',
      paystackRecipientCode: 'RCP_rundavidrunner01',
      totalTripsCompleted: 114,
      rating: 4.99,
      isApproved: true,
      currentHostelLocation: 'Daniel Hall Block A',
    },
    {
      id: 'courier-david-runner',
      userId: 'user-acu-courier-1',
      campusId: 'campus-acu-oyo',
      matricNumber: 'ACU/2023/LAW/054',
      studentIdUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
      baseHostelId: 'hostel-acu-akinola',
      status: 'available',
      bankName: 'Kuda Bank',
      accountNumber: '2019283746',
      accountName: 'David Adeleke Dispatch',
      paystackRecipientCode: 'RCP_davidrunner01',
      totalTripsCompleted: 87,
      rating: 4.98,
      isApproved: true,
      currentHostelLocation: 'Akinola Block B',
    },
  ];

  for (const cp of courierProfiles) {
    await prisma.courierProfile.upsert({
      where: { id: cp.id },
      update: cp,
      create: cp,
    });
  }
  console.log(`✓ Seeded ${courierProfiles.length} Courier Profiles`);

  // 6. Products Catalog (Strictly 5 Curated Products)
  const products = [
    {
      id: 'prod-nike-af1',
      campusId: 'campus-acu-oyo',
      vendorId: 'vendor-tunde-kicks',
      title: "Nike Air Force 1 '07 Low (Triple White)",
      description: 'Original pristine condition. Available in size 42 & 43. Clean box and extra laces included.',
      category: 'shoes',
      condition: 'brand_new',
      price: 18500.0,
      compareAtPrice: 22000.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2',
      ]),
      stockQuantity: 4,
      isActive: true,
    },
    {
      id: 'prod-oraimo-65w',
      campusId: 'campus-acu-oyo',
      vendorId: 'vendor-tunde-kicks',
      title: 'Oraimo 65W GaN Fast Charger (Type-C + USB)',
      description: 'Super Charge 3.0 • Powers MacBooks, iPhones & Android devices. Ultra-compact design with smart heat dissipation.',
      category: 'electronics',
      condition: 'brand_new',
      price: 9000.0,
      compareAtPrice: 11500.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0',
      ]),
      stockQuantity: 8,
      isActive: true,
    },
    {
      id: 'prod-varsity-hoodie',
      campusId: 'campus-acu-oyo',
      vendorId: 'vendor-tunde-kicks',
      title: 'Vintage Oversized ACU Varsity Hoodie',
      description: 'Clean Thrift • Navy & Gold Embroidered Crest • Heavyweight cotton fleece, perfect for chilly lecture halls.',
      category: 'fashion',
      condition: 'clean_thrift',
      price: 14500.0,
      compareAtPrice: 18000.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
      ]),
      stockQuantity: 3,
      isActive: true,
    },
    {
      id: 'prod-grilled-asun',
      campusId: 'campus-acu-oyo',
      vendorId: 'vendor-tunde-kicks',
      title: 'Spicy Peppered Goat Meat (Asun) + Fried Yam',
      description: 'Freshly prepared evening special. Packaged hot with extra pepper sauce.',
      category: 'food',
      condition: 'freshly_cooked',
      price: 3500.0,
      compareAtPrice: 4000.0,
      images: JSON.stringify(['https://images.unsplash.com/photo-1544025162-d76694265947']),
      stockQuantity: 15,
      isActive: true,
    },
    {
      id: 'prod-calc2-notes',
      campusId: 'campus-acu-oyo',
      vendorId: 'vendor-tunde-kicks',
      title: 'MAT 201 Calculus II Solved Past Questions & Lecture Notes',
      description: 'Comprehensive handwritten guide by 4.89 CGPA student. Includes 2018-2024 exams.',
      category: 'academics',
      condition: 'clean_thrift',
      price: 2500.0,
      compareAtPrice: 3000.0,
      images: JSON.stringify(['https://images.unsplash.com/photo-1532012164546-f432f2e3777a']),
      stockQuantity: 10,
      isActive: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log(`✓ Seeded ${products.length} Active ACU Campus Products`);

  // 7. Seed Active Order with Escrow (ACU-4829) only if explicitly enabled
  if (process.env.SEED_DEMO_ORDER === 'true') {
    const plainPin = '4829';
    const handshakePinHash = await bcrypt.hash(plainPin, 8);

    const activeOrder = {
      id: 'order-acu-4829',
      orderNumber: 'ACU-4829',
      campusId: 'campus-acu-oyo',
      buyerId: 'user-acu-buyer-1',
      vendorId: 'vendor-tunde-kicks',
      courierId: 'courier-david-runner',
      status: 'at_porter_desk',
      deliveryMethod: 'courier_runner',
      dropoffHostelId: 'hostel-acu-oyinlola',
      dropoffRoom: 'Room 204',
      contactPhone: '08143829102',
      specialInstructions: 'Call Folake when at Oyinlola ground floor porter reception desk.',
    };

    await prisma.order.upsert({
      where: { id: activeOrder.id },
      update: activeOrder,
      create: activeOrder,
    });

    const orderEscrow = {
      id: 'escrow-acu-4829',
      orderId: 'order-acu-4829',
      itemSubtotal: 18500.0,
      platformTechFee: 100.0,
      courierDeliveryFee: 250.0,
      totalAmount: 18850.0,
      paystackReference: 'pstk_ref_acu_4829_demo',
      paystackPaymentStatus: 'held_in_escrow',
      handshakePinHash,
      plainPinForDev: plainPin,
      pinAttemptsCount: 0,
    };

    await prisma.orderEscrow.upsert({
      where: { id: orderEscrow.id },
      update: orderEscrow,
      create: orderEscrow,
    });

    console.log('✓ Seeded Active Escrow Order ACU-4829 (Status: at_porter_desk, PIN: 4829)');
  } else {
    console.log('✓ Orders table kept completely clean (0 active or pending orders)');
  }
  console.log('🎉 UniHive Database Seeding Completed Successfully.');
}

// Auto-run if executed directly via tsx
seedDatabase()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
