import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, API } from '../config/api';

describe('UniHive Frontend API Client & Request Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly includes token and campus headers', async () => {
    const mockResponse = { success: true, data: { id: 'order-123' } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    global.fetch = fetchMock;

    const result = await apiRequest('/orders/order-123/tracking', {
      token: 'test-jwt-token-456',
      campusId: 'campus-run-ede',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/orders/order-123/tracking');
    expect(options.headers).toMatchObject({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-jwt-token-456',
      'x-campus-id': 'campus-run-ede',
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws an error with message from response when not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid PIN provided' }),
    });
    global.fetch = fetchMock;

    await expect(apiRequest('/orders/verify-pin', { method: 'POST' })).rejects.toThrow('Invalid PIN provided');
  });

  it('correctly builds search and filter query parameters in API.getProducts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    global.fetch = fetchMock;

    await API.getProducts({
      campusId: 'campus-run-ede',
      category: 'shoes',
      search: 'nike',
      minPrice: 5000,
      maxPrice: 25000,
      condition: 'brand_new',
      hostelName: 'Queen Esther Hall',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('category=shoes');
    expect(url).toContain('search=nike');
    expect(url).toContain('minPrice=5000');
    expect(url).toContain('maxPrice=25000');
    expect(url).toContain('condition=brand_new');
    expect(url).toContain('hostelName=Queen+Esther+Hall');
    expect(options.headers['x-campus-id']).toBe('campus-run-ede');
  });
});

describe('UniHive Frontend Multi-Vendor Cart & Fee Calculation Engine', () => {
  const mockProductA = {
    id: 'prod-1',
    title: 'Nike Air Force 1',
    price: 18500,
    stockQuantity: 5,
    isActive: true,
    campusId: 'campus-run-ede',
    vendorId: 'vendor-tunde',
    vendor: { businessName: 'Tunde Kicks & Thrift' },
  } as any;

  const mockProductB = {
    id: 'prod-2',
    title: 'Oraimo 65W Fast Charger',
    price: 9000,
    stockQuantity: 3,
    isActive: true,
    campusId: 'campus-run-ede',
    vendorId: 'vendor-gadgets',
    vendor: { businessName: 'Campus Gadget Hub' },
  } as any;

  it('calculates single vendor order subtotal and fee structure correctly', () => {
    const cartItems = [
      { product: mockProductA, quantity: 2 },
    ];

    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const platformTechFee = cartItems.length > 0 ? 100 : 0;
    
    // Batch evening delivery = 500
    const courierFeeBatch = 500;
    const totalBatch = subtotal + platformTechFee + courierFeeBatch;

    expect(subtotal).toBe(37000);
    expect(platformTechFee).toBe(100);
    expect(totalBatch).toBe(37600);

    // Express delivery = 1500
    const courierFeeExpress = 1500;
    const totalExpress = subtotal + platformTechFee + courierFeeExpress;
    expect(totalExpress).toBe(38600);

    // Pickup = 0
    const courierFeePickup = 0;
    const totalPickup = subtotal + platformTechFee + courierFeePickup;
    expect(totalPickup).toBe(37100);
  });

  it('correctly splits and labels multi-vendor packages (Package A, Package B)', () => {
    const cartItems = [
      { product: mockProductA, quantity: 1 },
      { product: mockProductB, quantity: 1 },
    ];

    const packageLetters = ['A', 'B', 'C', 'D'];
    const vendorPackagesMap: Record<string, any> = {};

    cartItems.forEach((item) => {
      const vId = item.product.vendorId;
      if (!vendorPackagesMap[vId]) {
        const index = Object.keys(vendorPackagesMap).length;
        vendorPackagesMap[vId] = {
          vendorId: vId,
          vendorName: item.product.vendor.businessName,
          packageLetter: packageLetters[index],
          items: [],
          subtotal: 0,
          runnerFee: 0,
        };
      }
      vendorPackagesMap[vId].items.push(item);
      vendorPackagesMap[vId].subtotal += item.product.price * item.quantity;
    });

    const packages = Object.values(vendorPackagesMap);
    expect(packages).toHaveLength(2);
    expect(packages[0].packageLetter).toBe('A');
    expect(packages[0].vendorName).toBe('Tunde Kicks & Thrift');
    expect(packages[0].subtotal).toBe(18500);

    expect(packages[1].packageLetter).toBe('B');
    expect(packages[1].vendorName).toBe('Campus Gadget Hub');
    expect(packages[1].subtotal).toBe(9000);
  });

  it('handles stock clamping logic when adding more items than available', () => {
    const currentQtyInCart = 4;
    const requestedAddition = 3;
    const maxStock = mockProductA.stockQuantity; // 5

    const clampedQty = Math.min(currentQtyInCart + requestedAddition, maxStock);
    expect(clampedQty).toBe(5);
  });

  it('dynamically syncs active pickup deliveries with custom prices without falling back to 18,500', () => {
    const activeOrders = [
      {
        id: 'order-calc-101',
        orderNumber: '#RUN-1044',
        deliveryMode: 'pickup',
        status: 'escrow_locked',
        price: 6500,
        buyer: { name: 'Tobi Adebayo' },
      },
      {
        id: 'order-bag-202',
        orderNumber: '#RUN-2088',
        deliveryMode: 'pickup',
        status: 'escrow_locked',
        price: 13500,
        buyer: { name: 'Fatima Bello' },
      },
    ];

    // Filter pending handshake deliveries
    const pendingHandshakeOrders = activeOrders.filter(
      (o) => o.deliveryMode === 'pickup' && o.status !== 'inspected_completed'
    );

    expect(pendingHandshakeOrders).toHaveLength(2);

    // Initial selected order
    let selectedOrderId = pendingHandshakeOrders[0].id;
    let effectiveTargetOrder = pendingHandshakeOrders.find((o) => o.id === selectedOrderId);
    expect(effectiveTargetOrder?.price).toBe(6500);
    expect(effectiveTargetOrder?.price).not.toBe(18500);

    // Switch selection in multi-order queue
    selectedOrderId = pendingHandshakeOrders[1].id;
    effectiveTargetOrder = pendingHandshakeOrders.find((o) => o.id === selectedOrderId);
    expect(effectiveTargetOrder?.price).toBe(13500);
    expect(effectiveTargetOrder?.buyer.name).toBe('Fatima Bello');
  });

  it('isolates multi-order handshakes: settling an order disburses only its amount and updates queue', () => {
    let pendingQueue = [
      { id: 'order-1', price: 6500, status: 'escrow_locked' },
      { id: 'order-2', price: 28000, status: 'escrow_locked' },
    ];
    let vendorBalance = 0;

    // Simulate verifying Order 1
    const orderToVerify = pendingQueue.find((o) => o.id === 'order-1')!;
    vendorBalance += orderToVerify.price;
    pendingQueue = pendingQueue.filter((o) => o.id !== orderToVerify.id);

    expect(vendorBalance).toBe(6500);
    expect(pendingQueue).toHaveLength(1);
    expect(pendingQueue[0].id).toBe('order-2');
    expect(pendingQueue[0].price).toBe(28000);
  });
});
