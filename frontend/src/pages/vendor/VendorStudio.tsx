import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { useSocket } from '../../context/SocketContext';
import type { Product, VendorPayoutAccount } from '../../types';
import { API } from '../../config/api';
import { useResponsive } from '../../hooks/useResponsive';
import {
  PlusCircle,
  Lock,
  Bike,
  UserCheck,
  Building2,
  CheckCircle2,
  RotateCcw,
  Mail,
  Clock,
  ShieldCheck,
  X,
  AlertTriangle,
  Package,
  CreditCard,
  Trash2,
  Star,
  Check,
  Edit3,
  Search,
  Minus,
  Plus,
  Tag,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';
import { ProductGraphic } from '../../components/common/ProductGraphic';

const CAMPUS_PRODUCT_PHOTO_PRESETS = [
  {
    name: 'Nike Sneakers',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    icon: '👟',
  },
  {
    name: 'Campus Slides',
    url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
    icon: '🩴',
  },
  {
    name: 'Vintage Jersey',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    icon: '👕',
  },
  {
    name: '65W Fast Charger',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    icon: '🔌',
  },
  {
    name: 'Spicy Asun & Yam',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    icon: '🍖',
  },
  {
    name: 'Solved Past Questions',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    icon: '📚',
  },
];

const getPreviewGraphicType = (title: string, category: string): 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks' => {
  const lower = `${title} ${category}`.toLowerCase();
  if (lower.includes('nike') || lower.includes('shoe') || lower.includes('kick') || lower.includes('af1') || lower.includes('slide') || category === 'shoes') return 'sneaker';
  if (lower.includes('charge') || lower.includes('gadget') || lower.includes('power') || lower.includes('tech') || category === 'tech') return 'charger';
  if (lower.includes('food') || lower.includes('asun') || lower.includes('jollof') || lower.includes('meat') || category === 'food') return 'food';
  if (lower.includes('sock')) return 'socks';
  return 'jacket';
};

const NIGERIAN_BANKS = [
  { name: 'OPay Digital Services', code: 'opay', color: '#059669', bg: '#ECFDF5' },
  { name: 'PalmPay', code: 'palmpay', color: '#7C3AED', bg: '#F5F3FF' },
  { name: 'Kuda Bank', code: 'kuda', color: '#4F46E5', bg: '#EEF2FF' },
  { name: 'Moniepoint MFB', code: 'moniepoint', color: '#0284C7', bg: '#F0F9FF' },
  { name: 'Guaranty Trust Bank (GTBank)', code: 'gtbank', color: '#D97706', bg: '#FFFBEB' },
  { name: 'Access Bank', code: 'access-bank', color: '#EA580C', bg: '#FFF7ED' },
  { name: 'Zenith Bank', code: 'zenith-bank', color: '#DC2626', bg: '#FEF2F2' },
  { name: 'United Bank for Africa (UBA)', code: 'uba', color: '#B91C1C', bg: '#FEF2F2' },
  { name: 'First Bank of Nigeria', code: 'first-bank', color: '#1D4ED8', bg: '#EFF6FF' },
  { name: 'Stanbic IBTC Bank', code: 'stanbic-ibtc', color: '#0369A1', bg: '#F0F9FF' },
  { name: 'Fidelity Bank', code: 'fidelity-bank', color: '#15803D', bg: '#F0FDF4' },
  { name: 'Wema Bank (ALAT)', code: 'wema-alat', color: '#9333EA', bg: '#FAF5FF' },
];

export const VendorStudio: React.FC = () => {
  const { token, user, vendorProfile } = useAuth();
  const { currentCampus, hostels } = useCampus();
  const { socket } = useSocket();
  const { isMobile } = useResponsive();

  // Suspension & Official Appeal State
  const [vendorIsSuspended, setVendorIsSuspended] = useState<boolean>(() => {
    return !!(user?.isSuspended || vendorProfile?.isSuspended);
  });
  const [vendorAppealStatus, setVendorAppealStatus] = useState<string | null>(() => {
    return vendorProfile?.appealStatus || (user as any)?.appealStatus || null;
  });
  const [vendorAppealMessage, setVendorAppealMessage] = useState<string>(() => {
    return vendorProfile?.appealMessage || (user as any)?.appealMessage || '';
  });
  const [appealInput, setAppealInput] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);

  // Vendor Dispute Defense Statements state
  const [disputeStatementsMap, setDisputeStatementsMap] = useState<Record<string, string>>({});
  const [disputeInputMap, setDisputeInputMap] = useState<Record<string, string>>({});
  const [submittingDisputeMap, setSubmittingDisputeMap] = useState<Record<string, boolean>>({});

  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<'courier' | 'self'>('courier');
  const [selfDeliveryPin, setSelfDeliveryPin] = useState(['', '', '', '']);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [selectedPickupOrderId, setSelectedPickupOrderId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live Wallet balances
  const [escrowInTransit, setEscrowInTransit] = useState(0);
  const [settledWithdrawn, setSettledWithdrawn] = useState(0);
  const [settledCount, setSettledCount] = useState(0);

  // Orders & Fulfillment Pipeline State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderCounts, setOrderCounts] = useState({
    in_transit: 0,
    at_porter_desk: 0,
    completed: 0,
    refunded: 0,
    disputed: 0,
    total: 0,
  });
  const [selectedPipelineTab, setSelectedPipelineTab] = useState<
    'all' | 'in_transit' | 'at_porter_desk' | 'completed' | 'refunded' | 'receipts'
  >('all');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Email Notifications Inbox State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

  // Payout Accounts State
  const [payoutAccounts, setPayoutAccounts] = useState<VendorPayoutAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('OPay Digital Services');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newIsPrimary, setNewIsPrimary] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState<string | null>(null);
  const [accountToast, setAccountToast] = useState<string | null>(null);
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [submittingAccount, setSubmittingAccount] = useState(false);

  // New product form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('shoes');
  const [condition, setCondition] = useState('brand_new');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stockQuantity, setStockQuantity] = useState('5');
  const [hostelName, setHostelName] = useState(hostels[0]?.name || 'Queen Esther Hall');
  const [sizeBadge, setSizeBadge] = useState('Size 43');
  const [comboBadge, setComboBadge] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'preview'>('details');
  const [formError, setFormError] = useState<string | null>(null);

  // Catalog Management State (Option 5 & Out of Stock)
  const [catalogTab, setCatalogTab] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [productActionLoading, setProductActionLoading] = useState<string | null>(null);
  const [catalogToast, setCatalogToast] = useState<string | null>(null);

  // Load Vendor Payout Accounts
  const loadPayoutAccounts = async () => {
    if (!token) return;
    setLoadingAccounts(true);
    try {
      const res = await API.getVendorPayoutAccounts(token);
      if (res.success && res.data?.accounts) {
        setPayoutAccounts(res.data.accounts);
      }
    } catch (err) {
      console.warn('Could not load payout accounts', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSetPrimaryAccount = async (account: VendorPayoutAccount) => {
    if (!token || account.isPrimary) return;
    setAccountActionLoading(account.id);
    try {
      const res = await API.setPrimaryPayoutAccount(account.id, token);
      if (res.success) {
        setAccountToast(`Primary settlement switched to ${account.bankName}!`);
        setTimeout(() => setAccountToast(null), 4000);
        await loadPayoutAccounts();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update primary payout account');
    } finally {
      setAccountActionLoading(null);
    }
  };

  const handleDeleteAccount = async (account: VendorPayoutAccount) => {
    if (!token) return;
    if (payoutAccounts.length <= 1) {
      alert('Cannot delete your only settlement account. You must have at least one payout account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${account.bankName} (${account.accountNumber})?`)) {
      return;
    }
    setAccountActionLoading(account.id);
    try {
      const res = await API.deleteVendorPayoutAccount(account.id, token);
      if (res.success) {
        setAccountToast(`Removed ${account.bankName} payout account.`);
        setTimeout(() => setAccountToast(null), 3500);
        await loadPayoutAccounts();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete payout account');
    } finally {
      setAccountActionLoading(null);
    }
  };

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setAccountFormError(null);

    const cleanNum = newAccountNumber.trim();
    if (!/^\d{10}$/.test(cleanNum)) {
      setAccountFormError('Account number must be exactly 10 digits (Nigerian NUBAN)');
      return;
    }

    if (!newAccountName.trim() || newAccountName.trim().length < 2) {
      setAccountFormError('Please enter verified account holder name');
      return;
    }

    setSubmittingAccount(true);
    try {
      const selectedBank = NIGERIAN_BANKS.find((b) => b.name === newBankName);
      const res = await API.addVendorPayoutAccount(
        {
          bankName: newBankName,
          bankCode: selectedBank?.code || newBankName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          accountNumber: cleanNum,
          accountName: newAccountName.trim(),
          isPrimary: newIsPrimary || payoutAccounts.length === 0,
        },
        token
      );
      if (res.success) {
        setIsAddAccountModalOpen(false);
        setNewAccountNumber('');
        setNewAccountName('');
        setNewIsPrimary(false);
        setAccountToast(`Successfully linked ${newBankName} (${cleanNum})!`);
        setTimeout(() => setAccountToast(null), 4000);
        await loadPayoutAccounts();
      }
    } catch (err: any) {
      setAccountFormError(err.message || 'Failed to link payout account');
    } finally {
      setSubmittingAccount(false);
    }
  };

  // Load Vendor Orders & Email Notifications
  const loadVendorData = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const [ordersRes, notifsRes] = await Promise.all([
        API.getVendorOrders(token),
        API.getVendorNotifications(token),
      ]);

      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.orders || []);
        if (ordersRes.data.counts) {
          setOrderCounts(ordersRes.data.counts);
        }

        const pendingEscrow = (ordersRes.data.orders || [])
          .filter(
            (o: any) =>
              o.status === 'in_transit' ||
              o.status === 'at_porter_desk' ||
              o.status === 'escrow_locked' ||
              o.status === 'pending_payment'
          )
          .reduce((sum: number, o: any) => sum + (o.price || o.itemSubtotal || o.escrow?.itemSubtotal || 0), 0);

        const settledSum = (ordersRes.data.orders || [])
          .filter((o: any) => o.status === 'inspected_completed')
          .reduce((sum: number, o: any) => sum + (o.price || o.itemSubtotal || o.escrow?.itemSubtotal || 0), 0);

        const settledC = (ordersRes.data.orders || []).filter(
          (o: any) => o.status === 'inspected_completed'
        ).length;

        setEscrowInTransit(pendingEscrow);
        setSettledWithdrawn(settledSum);
        setSettledCount(settledC);
      }

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data || []);
      }
    } catch (err) {
      console.warn('Could not load vendor orders/notifications', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Clear all email notifications & receipts
  const handleClearAllNotifications = async () => {
    if (!token) return;
    try {
      await API.clearVendorNotifications(token);
      setNotifications([]);
      setSelectedNotification(null);
      setAccountToast('All email notifications and receipts cleared successfully.');
      setTimeout(() => setAccountToast(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to clear notifications');
    }
  };

  useEffect(() => {
    async function loadVendorProducts() {
      try {
        const res = await API.getProducts({ campusId: currentCampus?.id });
        if (res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadVendorProducts();
    loadVendorData();
    loadPayoutAccounts();
  }, [currentCampus, token]);


  // Real-time socket listener for order status changes and vendor email notifications
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatus = (data: any) => {
      console.log('[Socket] Vendor studio received order status update:', data);
      loadVendorData();
    };

    const handleVendorNotif = (data: any) => {
      console.log('[Socket] Vendor studio received new notification:', data);
      loadVendorData();
    };

    socket.on('order:status_changed', handleOrderStatus);
    socket.on('vendor:new_notification', handleVendorNotif);

    // Real-time listener for vendor suspension and appeal updates
    const handleVendorStatusChange = (data: any) => {
      console.log('[VendorStudio] Real-time vendor status change received:', data);
      if (data.isSuspended !== undefined) {
        setVendorIsSuspended(!!data.isSuspended);
      }
      if (data.appealStatus !== undefined) {
        setVendorAppealStatus(data.appealStatus);
      }
      if (data.appealMessage !== undefined) {
        setVendorAppealMessage(data.appealMessage);
      }
    };
    socket.on('vendor:status_changed', handleVendorStatusChange);

    return () => {
      socket.off('order:status_changed', handleOrderStatus);
      socket.off('vendor:new_notification', handleVendorNotif);
      socket.off('vendor:status_changed', handleVendorStatusChange);
    };
  }, [socket]);

  // Load current vendor profile on mount
  useEffect(() => {
    if (!token) return;
    API.getVendorProfile(token)
      .then((res: any) => {
        if (res.success && res.data) {
          setVendorIsSuspended(!!res.data.isSuspended);
          setVendorAppealStatus(res.data.appealStatus || null);
          setVendorAppealMessage(res.data.appealMessage || '');
        }
      })
      .catch((err) => console.warn('Could not load vendor profile', err));
  }, [token]);

  const handleSendAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealInput.trim() || appealInput.trim().length < 5) {
      setAppealError('Please write a detailed explanation for your appeal (minimum 5 characters).');
      return;
    }
    if (!token) return;
    setSubmittingAppeal(true);
    setAppealError(null);
    try {
      const res = await API.submitVendorAppeal(appealInput.trim(), token);
      if (res.success) {
        setVendorAppealStatus('pending');
        setVendorAppealMessage(appealInput.trim());
        setAppealSuccess(true);
      }
    } catch (err: any) {
      setAppealError(err.message || 'Failed to submit appeal');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const handleSubmitDefenseStatement = async (orderId: string) => {
    const text = disputeInputMap[orderId];
    if (!text || text.trim().length < 3) return;
    if (!token) return;
    setSubmittingDisputeMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await API.submitVendorDisputeStatement(orderId, text.trim(), token);
      if (res.success) {
        setDisputeStatementsMap((prev) => ({ ...prev, [orderId]: text.trim() }));
      }
    } catch (err: any) {
      console.error('Failed to submit vendor defense statement', err);
    } finally {
      setSubmittingDisputeMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Active deliveries pending handshake (either designated pickup or all active pending orders)
  const activePickupDeliveries = orders.filter(
    (o: any) =>
      (o.deliveryMode === 'pickup' || o.deliveryMethod === 'vendor_self') &&
      o.status !== 'inspected_completed' &&
      o.status !== 'completed' &&
      o.status !== 'refunded'
  );

  const activeAllPendingDeliveries = orders.filter(
    (o: any) =>
      o.status !== 'inspected_completed' &&
      o.status !== 'completed' &&
      o.status !== 'refunded'
  );

  // Prioritize designated pickup orders, but include any active deliveries if vendor is delivering themselves
  const pendingHandshakeOrders = activePickupDeliveries.length > 0
    ? activePickupDeliveries
    : activeAllPendingDeliveries;

  // Currently selected order in the handshake queue (or null if queue is empty)
  const effectiveTargetOrder =
    pendingHandshakeOrders.find((o: any) => o.id === selectedPickupOrderId) ||
    pendingHandshakeOrders[0] ||
    null;

  const handleSelfDeliveryVerify = async () => {
    if (!effectiveTargetOrder) return;
    const pin = selfDeliveryPin.join('');
    if (pin.length !== 4) {
      setPinError('Please enter all 4 digits of the buyer PIN');
      return;
    }
    setPinError(null);
    try {
      const orderIdToVerify = effectiveTargetOrder.id;
      // In demo or test mode with local test IDs, simulate approval directly
      if (orderIdToVerify.startsWith('order-test-') || !token) {
        setPinSuccess(true);
        const amount = effectiveTargetOrder.price || effectiveTargetOrder.itemSubtotal || 0;
        setEscrowInTransit((prev) => Math.max(0, prev - amount));
        setSettledWithdrawn((prev) => prev + amount);
        setSettledCount((prev) => prev + 1);
        setAccountToast(`✓ Verified Order ${effectiveTargetOrder.orderNumber || effectiveTargetOrder.id}! ₦${amount.toLocaleString()} disbursed to your payout account.`);
        setTimeout(() => setAccountToast(null), 4500);
        setOrders((prev) => prev.map((o) => o.id === orderIdToVerify ? { ...o, status: 'inspected_completed' } : o));
        setSelfDeliveryPin(['', '', '', '']);
        return;
      }

      const res = await API.verifyPin(orderIdToVerify, pin, token);
      if (res.success) {
        setPinSuccess(true);
        const amount = effectiveTargetOrder.price || effectiveTargetOrder.itemSubtotal || 0;
        setEscrowInTransit((prev) => Math.max(0, prev - amount));
        setSettledWithdrawn((prev) => prev + amount);
        setSettledCount((prev) => prev + 1);
        setAccountToast(`✓ Verified Order ${effectiveTargetOrder.orderNumber || effectiveTargetOrder.id}! ₦${amount.toLocaleString()} disbursed to your payout account.`);
        setTimeout(() => setAccountToast(null), 4500);
        setSelfDeliveryPin(['', '', '', '']);
        await loadVendorData();
      }
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN. Handshake verification failed.');
    }
  };

  const handleCreateTestPickupOrder = (testPrice: number, testTitle: string) => {
    const randomOrderNum = `RUN-${Math.floor(1000 + Math.random() * 8999)}`;
    const randomId = `order-test-${Date.now()}`;
    const studentNames = ['Tobi Adebayo', 'Chinedu Okafor', 'Fatima Bello', 'Zainab Danjuma', 'Amaka Okeke'];
    const buyerName = studentNames[Math.floor(Math.random() * studentNames.length)];
    const randomRoom = `Room ${Math.floor(100 + Math.random() * 899)}`;
    const randomPhone = `081${Math.floor(10000000 + Math.random() * 89999999)}`;

    const newTestOrder = {
      id: randomId,
      orderNumber: `#${randomOrderNum}`,
      status: 'escrow_locked',
      deliveryMethod: 'vendor_self',
      deliveryMode: 'pickup',
      specialInstructions: `[DIRECT PICKUP] ${testTitle}`,
      price: testPrice,
      itemSubtotal: testPrice,
      escrowTotal: testPrice + 100,
      totalAmount: testPrice + 100,
      itemTitle: testTitle,
      product: {
        title: testTitle,
        category: 'general',
      },
      buyer: {
        name: buyerName,
        phone: randomPhone,
        roomNumber: randomRoom,
      },
      dropoffHostel: {
        name: hostels[0]?.name || 'Queen Esther Hall',
        porterLodgeName: hostels[0]?.porterLodgeName || 'Ground-Floor Reception',
      },
      escrowStatus: 'held_in_escrow',
      pinAttemptsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newTestOrder, ...prev]);
    setSelectedPickupOrderId(randomId);
    setSelfDeliveryPin(['', '', '', '']);
    setPinError(null);
    setPinSuccess(false);
    setAccountToast(`Created test pickup order #${randomOrderNum} for ₦${testPrice.toLocaleString()}!`);
    setTimeout(() => setAccountToast(null), 3500);
  };

  // Photo & Media Handlers with Client-Side Canvas Compression
  const compressImageFile = (file: File, maxDimension = 1200, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = e.target?.result as string;
        if (!rawUrl) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImageFile(file);
        if (compressed) {
          setImages((prev) => [...prev, compressed]);
        }
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setImages((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageUrlInput('');
    setIsUrlInputOpen(false);
  };

  const handleAddPresetImage = (presetUrl: string) => {
    setImages((prev) => [...prev, presetUrl]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setFormError(null);

    try {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error('Please enter a valid selling price in Naira (₦)');
      }

      const parsedCompareAt = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
      const parsedStock = parseInt(stockQuantity, 10);

      const fullDescription = description.trim() + (deliveryNotes.trim() ? `\n\n[Dispatch Notes]: ${deliveryNotes.trim()}` : '');

      const res = await API.createProduct(
        {
          title: title.trim(),
          category,
          condition,
          price: parsedPrice,
          compareAtPrice: parsedCompareAt,
          description: fullDescription || 'Authentic campus listing verified by vendor.',
          stockQuantity: isNaN(parsedStock) ? 1 : Math.max(0, parsedStock),
          images: images.length > 0 ? images : [],
          hostelName: hostelName || 'Queen Esther Hall',
          sizeBadge: sizeBadge.trim() || undefined,
          comboBadge: comboBadge.trim() || undefined,
        },
        token,
        currentCampus?.id || 'campus-run-ede'
      );

      if (res.data) {
        setProducts([res.data, ...products]);
        setIsAddModalOpen(false);
        // Reset form
        setTitle('');
        setPrice('');
        setCompareAtPrice('');
        setDescription('');
        setDeliveryNotes('');
        setImages([]);
        setImageUrlInput('');
        setSizeBadge('Size 43');
        setComboBadge('');
        setActiveModalTab('details');
        setCatalogToast(`"${res.data.title}" successfully published to campus marketplace!`);
        setTimeout(() => setCatalogToast(null), 3500);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Stock and Catalog Actions
  const handleToggleStock = async (product: Product) => {
    if (!token) return;
    setProductActionLoading(product.id);
    try {
      const res = await API.toggleProductStock(product.id, token);
      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stockQuantity: res.data.stockQuantity, isActive: res.data.isActive }
              : p
          )
        );
        const isNowInStock = res.data.isActive && res.data.stockQuantity > 0;
        setCatalogToast(`"${product.title}" ${isNowInStock ? 'marked In Stock!' : 'marked Out of Stock!'}`);
        setTimeout(() => setCatalogToast(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product stock');
    } finally {
      setProductActionLoading(null);
    }
  };

  const handleAdjustStock = async (product: Product, delta: number) => {
    if (!token) return;
    const newQty = Math.max(0, product.stockQuantity + delta);
    setProductActionLoading(product.id);
    try {
      const res = await API.updateProduct(product.id, { stockQuantity: newQty }, token);
      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stockQuantity: res.data.stockQuantity, isActive: res.data.isActive }
              : p
          )
        );
        setCatalogToast(`Stock updated: ${product.title} (${newQty} units)`);
        setTimeout(() => setCatalogToast(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock quantity');
    } finally {
      setProductActionLoading(null);
    }
  };

  const handleOpenPriceModal = (product: Product) => {
    setEditingProduct(product);
    setEditPriceInput(product.price.toString());
    setIsPriceModalOpen(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;
    const parsedPrice = parseFloat(editPriceInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price amount');
      return;
    }
    setProductActionLoading(editingProduct.id);
    try {
      const res = await API.updateProduct(editingProduct.id, { price: parsedPrice }, token);
      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, price: res.data.price } : p))
        );
        setCatalogToast(`Price updated: ₦${parsedPrice.toLocaleString()}`);
        setTimeout(() => setCatalogToast(null), 3500);
        setIsPriceModalOpen(false);
        setEditingProduct(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    } finally {
      setProductActionLoading(null);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to remove "${product.title}" from your campus listings?`)) {
      return;
    }
    setProductActionLoading(product.id);
    try {
      const res = await API.deleteProduct(product.id, token);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setCatalogToast(`Listing "${product.title}" removed`);
        setTimeout(() => setCatalogToast(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove listing');
    } finally {
      setProductActionLoading(null);
    }
  };

  const primaryAccount = payoutAccounts.find((a) => a.isPrimary) || payoutAccounts[0];

  // If vendor account is suspended by admin, display ONLY the suspension notice & official appeal form
  if (vendorIsSuspended) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px 80px 16px',
          background: '#0B1120',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            background: '#0F172A',
            border: '2px solid #EF4444',
            borderRadius: '24px',
            padding: '36px 24px',
            boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
            color: '#F8FAFC',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Warning Icon */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              margin: '0 auto 20px auto',
            }}
          >
            <AlertTriangle size={36} />
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.3px',
              margin: '0 0 10px 0',
            }}
          >
            Your Vendor Account Has Been Suspended
          </h2>

          <p
            style={{
              fontSize: '13.5px',
              color: '#94A3B8',
              lineHeight: 1.6,
              margin: '0 0 20px 0',
            }}
          >
            Your campus merchant store privileges have been placed on administrative hold by the <strong>Chief Proctor & Campus Operations Desk</strong>.
            All your product listings have been hidden from the marketplace, and pending payouts are frozen.
          </p>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#FCD34D',
              lineHeight: 1.5,
            }}
          >
            ℹ️ If you believe we have made a wrong decision or if you have resolved the compliance violation, you can submit an appeal below. Your appeal message will be displayed directly to the Chief Proctor in the Admin Console.
          </div>

          {/* Pending Appeal Notice */}
          {vendorAppealStatus === 'pending' || appealSuccess ? (
            <div
              style={{
                background: '#162035',
                border: '1.5px solid #3B82F6',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <Clock size={18} color="#60A5FA" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#93C5FD' }}>
                  Appeal Submitted & Under Proctor Review
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '0 0 10px 0' }}>
                Your appeal message has been received and is visible in the <strong>Campus Stores Desk</strong> of the Admin Console:
              </p>
              <div
                style={{
                  background: '#0B1120',
                  border: '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '12.5px',
                  color: '#F1F5F9',
                  fontStyle: 'italic',
                }}
              >
                "{vendorAppealMessage || appealInput}"
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '10px' }}>
                Your account will automatically restore in real-time once the Chief Proctor reviews and reinstates your store.
              </div>
            </div>
          ) : (
            /* Appeal Form */
            <form onSubmit={handleSendAppeal} style={{ textAlign: 'left' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#CBD5E1',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                State Your Appeal Reasons:
              </label>
              <textarea
                rows={4}
                value={appealInput}
                onChange={(e) => setAppealInput(e.target.value)}
                placeholder="Explain why you believe this decision was a mistake or detail the steps taken to comply with campus regulations..."
                style={{
                  width: '100%',
                  background: '#162035',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  marginBottom: '12px',
                  outline: 'none',
                }}
              />

              {appealError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#FCA5A5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    marginBottom: '12px',
                  }}
                >
                  {appealError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingAppeal}
                style={{
                  width: '100%',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: submittingAppeal ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                }}
              >
                <ShieldCheck size={18} />
                <span>{submittingAppeal ? 'Transmitting Appeal...' : 'Submit Official Appeal to Proctor'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 16px 96px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Vendor Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, letterSpacing: '0.4px' }}>
            CAMPUS MERCHANT STUDIO
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Tunde Kicks & Thrift</h2>
            <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              Joshua Hall
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Primary Settlement:{' '}
            <strong style={{ color: '#0F2B5C' }}>
              {primaryAccount
                ? `${primaryAccount.bankName} (${primaryAccount.accountNumber})`
                : 'OPay Digital Services (8023 •••• 789)'}
            </strong>{' '}
            • Trust Rating: 4.95 ★
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="vendor-email-alerts-btn"
            onClick={() => {
              setIsNotificationModalOpen(true);
              if (isMobile) {
                // On mobile, start at the inbox list so the merchant has an overview
                setSelectedNotification(null);
              } else if (notifications.length > 0 && !selectedNotification) {
                setSelectedNotification(notifications[0]);
              }
            }}
            title="View automated Paystack settlement receipts and transit notices"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '4px' : '6px',
              padding: isMobile ? '8px 10px' : '8px 12px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#1E293B',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: 'relative',
            }}
          >
            <Mail size={isMobile ? 14 : 15} color="#2563EB" />
            <span>{isMobile ? 'Alerts' : 'Email Alerts'}</span>
            {notifications.length > 0 && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  fontWeight: 900,
                  marginLeft: '2px',
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: '#0F2B5C',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={15} />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Dual Wallet Balance Card matching Screen 6 */}
      <div
        style={{
          background: '#0F2B5C',
          borderRadius: '20px',
          padding: '20px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 8px 24px rgba(15, 43, 92, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.4px' }}>
            DIRECT PAYSTACK ESCROW VAULT
          </div>
          <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
            ● {primaryAccount ? `${primaryAccount.bankName} Live Sync` : 'OPay Live Sync'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#93C5FD' }}>Escrow In-Transit</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FBBF24', margin: '4px 0' }}>
              ₦{escrowInTransit.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#CBD5E1' }}>
              {escrowInTransit > 0 ? '1 order awaiting porter PIN' : '0 orders pending'}
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#93C5FD' }}>Settled & Withdrawn</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34D399', margin: '4px 0' }}>
              ₦{settledWithdrawn.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#CBD5E1' }}>{settledCount} completed deliveries</div>
          </div>
        </div>
      </div>

      {/* Direct Payout Accounts & Multi-Account Manager Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={18} color="#059669" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Direct Payout & Settlement Accounts
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Manage multiple Nigerian bank & fintech accounts. Direct Paystack split deposits 100% of earnings to your Primary account.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setAccountFormError(null);
              setIsAddAccountModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: '#0F2B5C',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(15,43,92,0.15)',
            }}
          >
            <PlusCircle size={15} />
            <span>+ Add Account</span>
          </button>
        </div>

        {/* Live Toast alert */}
        {accountToast && (
          <div
            style={{
              marginBottom: '14px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{accountToast}</span>
            </div>
            <button
              onClick={() => setAccountToast(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Accounts List / Grid */}
        {loadingAccounts && payoutAccounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: '12px' }}>
            Loading settlement accounts...
          </div>
        ) : payoutAccounts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
            }}
          >
            <CreditCard size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>No Payout Accounts Linked</div>
            <p style={{ fontSize: '11px', color: '#64748B', maxWidth: '340px', margin: '4px auto 12px auto' }}>
              Add your OPay, PalmPay, Kuda, or commercial bank account to receive immediate automatic payouts upon delivery.
            </p>
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Add First Account
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '12px',
            }}
          >
            {payoutAccounts.map((acc) => {
              const matchedBank = NIGERIAN_BANKS.find(
                (b) => b.name.toLowerCase() === acc.bankName.toLowerCase() || b.code === acc.bankCode
              );
              const bankBadgeColor = matchedBank?.color || '#0F2B5C';
              const bankBadgeBg = matchedBank?.bg || '#F1F5F9';
              const isActionRunning = accountActionLoading === acc.id;

              return (
                <div
                  key={acc.id}
                  style={{
                    borderRadius: '14px',
                    border: acc.isPrimary ? '2px solid #10B981' : '1px solid #E2E8F0',
                    background: acc.isPrimary ? '#F0FDF4' : '#FFFFFF',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    position: 'relative',
                    boxShadow: acc.isPrimary ? '0 4px 14px rgba(16, 185, 129, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Header with bank badge & primary tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: bankBadgeBg,
                            color: bankBadgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '12px',
                          }}
                        >
                          {acc.bankName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            {acc.bankName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>
                            Nigerian NUBAN
                          </div>
                        </div>
                      </div>

                      {acc.isPrimary ? (
                        <span
                          style={{
                            background: '#DCFCE7',
                            color: '#15803D',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Star size={11} fill="#15803D" />
                          PRIMARY
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#F1F5F9',
                            color: '#64748B',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          SECONDARY
                        </span>
                      )}
                    </div>

                    {/* Account Number & Holder */}
                    <div style={{ background: acc.isPrimary ? '#FFFFFF' : '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.4px' }}>
                        ACCOUNT NUMBER
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2B5C', letterSpacing: '1.2px', margin: '2px 0' }}>
                        {acc.accountNumber.slice(0, 4)} •••• {acc.accountNumber.slice(-3)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }}>
                        {acc.accountName}
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                    {acc.isPrimary ? (
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} />
                        <span>Active for Dual Escrow Release</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSetPrimaryAccount(acc)}
                        disabled={isActionRunning}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#0F2B5C',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: isActionRunning ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Star size={12} />
                        <span>{isActionRunning ? 'Updating...' : 'Set as Primary'}</span>
                      </button>
                    )}

                    {payoutAccounts.length > 1 && (
                      <button
                        onClick={() => handleDeleteAccount(acc)}
                        disabled={isActionRunning}
                        title="Remove this account"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: '1px solid #FEE2E2',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: isActionRunning ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          style={{
            marginTop: '14px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: '11px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
          <span>
            <strong>Paystack Dual Escrow Guarantee:</strong> 100% of vendor earnings disburse automatically to your active Primary account upon porter lodge PIN verification.
          </span>
        </div>
      </div>


      {/* Real-Time Orders & Fulfillment Pipeline */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="#0F2B5C" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Orders & Fulfillment Pipeline
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              Track real-time status of your sold campus products across courier transit, porter desks, payouts & refunds
            </p>
          </div>

          <button
            onClick={loadVendorData}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={13} />
            <span>{loadingOrders ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Pipeline Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '8px',
            borderBottom: '1px solid #F1F5F9',
            marginBottom: '14px',
          }}
        >
          {[
            { key: 'all', label: 'All Orders', count: orderCounts.total },
            { key: 'in_transit', label: '🚴 In Transit', count: orderCounts.in_transit },
            { key: 'at_porter_desk', label: '🏢 At Porter Desk', count: orderCounts.at_porter_desk },
            { key: 'completed', label: '✅ Completed / Paid', count: orderCounts.completed },
            { key: 'refunded', label: '↩️ Refunded', count: orderCounts.refunded },
            { key: 'receipts', label: '✉️ Email Receipts', count: notifications.length },
          ].map((tab) => {
            const isSelected = selectedPipelineTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedPipelineTab(tab.key as any)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #0F2B5C' : '1px solid #E2E8F0',
                  background: isSelected ? '#0F2B5C' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    borderRadius: '6px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders List / Receipts List */}
        {loadingOrders && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: '12px' }}>
            Loading fulfillment orders...
          </div>
        ) : (
          (() => {
            if (selectedPipelineTab === 'receipts') {
              if (notifications.length === 0) {
                return (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px dashed #CBD5E1',
                    }}
                  >
                    <Mail size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      No Email Receipts Dispatched Yet
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Official settlement receipts and transit alerts will automatically appear here as student orders are fulfilled.
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 4px 4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                      Showing {notifications.length} transactional receipt{notifications.length === 1 ? '' : 's'}
                    </span>
                    <button
                      onClick={handleClearAllNotifications}
                      style={{
                        padding: '4px 10px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={12} /> Clear All Receipts
                    </button>
                  </div>
                  {notifications.map((notif) => {
                    const isCompleted = notif.type === 'payment_completed';
                    const isTransit = notif.type === 'in_transit';
                    const isPorter = notif.type === 'at_porter_desk';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setSelectedNotification(notif);
                          setIsNotificationModalOpen(true);
                        }}
                        style={{
                          borderRadius: '14px',
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: isCompleted ? '#DCFCE7' : isTransit ? '#FEF3C7' : isPorter ? '#E0E7FF' : '#FEE2E2',
                                color: isCompleted ? '#166534' : isTransit ? '#92400E' : isPorter ? '#3730A3' : '#991B1B',
                              }}
                            >
                              {isCompleted ? 'PAYOUT RECEIPT' : isTransit ? 'IN TRANSIT' : isPorter ? 'PORTER DESK' : 'REFUND ALERT'}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F2B5C' }}>
                              Order {notif.orderId}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {new Date(notif.createdAt).toLocaleDateString('en-NG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {notif.subject}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Dispatched To: <strong style={{ color: '#334155' }}>{notif.recipientEmail}</strong>
                          </div>
                          <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> View Full Paystack Notice →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            const filteredOrders = orders.filter((o) => {
              if (selectedPipelineTab === 'all') return true;
              if (selectedPipelineTab === 'in_transit') return o.status === 'in_transit';
              if (selectedPipelineTab === 'at_porter_desk') return o.status === 'at_porter_desk';
              if (selectedPipelineTab === 'completed') return o.status === 'inspected_completed';
              if (selectedPipelineTab === 'refunded') return o.status === 'refunded';
              return true;
            });

            if (filteredOrders.length === 0) {
              return (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px dashed #CBD5E1',
                  }}
                >
                  <Package size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    No orders currently in {selectedPipelineTab.replace(/_/g, ' ')}
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Orders will automatically move into this tab as student runners log hostel deliveries and escrow resolves.
                  </p>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredOrders.map((order) => {
                  const isTransit = order.status === 'in_transit';
                  const isPorter = order.status === 'at_porter_desk';
                  const isCompleted = order.status === 'inspected_completed';
                  const isRefunded = order.status === 'refunded';
                  const isDisputed = order.status === 'disputed';

                  const badgeColor = isTransit
                    ? { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: '🚴 IN TRANSIT' }
                    : isPorter
                    ? { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE', label: '🏢 AT PORTER DESK' }
                    : isCompleted
                    ? { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0', label: '✅ COMPLETED & PAID' }
                    : isRefunded
                    ? { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', label: '↩️ REFUNDED' }
                    : isDisputed
                    ? { bg: '#FEE2E2', text: '#B91C1C', border: '#F87171', label: '⚠️ DISPUTED' }
                    : { bg: '#FEF9C3', text: '#854D0E', border: '#FEF08A', label: '🔒 ESCROW SECURED' };

                  return (
                    <div
                      key={order.id}
                      style={{
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Top row: Order ID, timestamp, and Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F2B5C' }}>
                            {order.id}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-NG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <span
                          style={{
                            background: badgeColor.bg,
                            color: badgeColor.text,
                            border: `1px solid ${badgeColor.border}`,
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: '20px',
                            letterSpacing: '0.3px',
                          }}
                        >
                          {badgeColor.label}
                        </span>
                      </div>

                      {/* Middle row: Product & Pricing */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {order.product?.images && order.product.images.length > 0 ? (
                              <img
                                src={order.product.images[0]}
                                alt={order.product?.title || 'Campus Item'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <ProductGraphic
                                type={
                                  order.product?.category === 'shoes'
                                    ? 'sneaker'
                                    : order.product?.category === 'tech'
                                    ? 'charger'
                                    : 'jacket'
                                }
                                size={32}
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              {order.product?.title || 'Campus Item'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Buyer: <strong style={{ color: '#334155' }}>{order.buyer?.name || 'Student Customer'}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F2B5C' }}>
                            ₦{(order.price || 18500).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '10px', color: isCompleted ? '#059669' : isRefunded ? '#DC2626' : '#D97706', fontWeight: 700 }}>
                            {isCompleted ? 'Transferred to OPay' : isRefunded ? 'Returned to Student' : 'Locked in Escrow'}
                          </div>
                        </div>
                      </div>

                      {/* Dropoff & Courier Info Banner */}
                      <div
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '8px',
                          fontSize: '11px',
                        }}
                      >
                        <div>
                          <div style={{ color: '#64748B', fontWeight: 700, fontSize: '10px' }}>
                            DESTINATION PORTER LODGE
                          </div>
                          <div style={{ color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Building2 size={13} color="#2563EB" />
                            <span>{order.dropoffHostel?.name || 'Queen Esther Hall (Female)'}</span>
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#64748B', fontWeight: 700, fontSize: '10px' }}>
                            RUNNER / COURIER
                          </div>
                          <div style={{ color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Bike size={13} color="#059669" />
                            <span>
                              {order.courier ? `${order.courier.name} (Runner)` : 'Campus Bicycle Courier'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Lifecycle Note */}
                      <div
                        style={{
                          fontSize: '11px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: isTransit
                            ? '#FFFBEB'
                            : isPorter
                            ? '#EFF6FF'
                            : isCompleted
                            ? '#F0FDF4'
                            : isRefunded
                            ? '#FEF2F2'
                            : '#F8FAFC',
                          color: isTransit
                            ? '#B45309'
                            : isPorter
                            ? '#1E40AF'
                            : isCompleted
                            ? '#166534'
                            : isRefunded
                            ? '#991B1B'
                            : '#475569',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isTransit && <Bike size={14} />}
                        {isPorter && <Building2 size={14} />}
                        {isCompleted && <CheckCircle2 size={14} />}
                        {isRefunded && <RotateCcw size={14} />}
                        {isDisputed && <AlertTriangle size={14} />}
                        <span>
                          {isTransit &&
                            'Runner picked up your package and is cycling to the hostel porter desk.'}
                          {isPorter &&
                            'Package safely logged at the ground-floor porter lodge. Buyer sent 4-digit inspection PIN.'}
                          {isCompleted &&
                            'Handshake complete! Customer verified PIN & Paystack transferred ₦' + (order.price || 18500).toLocaleString() + ' to your subaccount.'}
                          {isRefunded &&
                            'Dispute was resolved in favor of the student. Escrow funds refunded to student wallet.'}
                          {!isTransit && !isPorter && !isCompleted && !isRefunded &&
                            'Payment locked in Paystack escrow. Awaiting dispatch assignment.'}
                        </span>
                      </div>

                      {/* Dispute Defense Statement Box */}
                      {isDisputed && (
                        <div
                          style={{
                            background: '#FEF2F2',
                            border: '1.5px solid #F87171',
                            borderRadius: '10px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertTriangle size={15} color="#DC2626" />
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#991B1B' }}>
                                Order Disputed at Porter Lodge Inspection
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', background: '#FEE2E2', color: '#B91C1C', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              UNDER PROCTOR REVIEW
                            </span>
                          </div>

                          <div style={{ fontSize: '11.5px', color: '#7F1D1D' }}>
                            <strong>Buyer Complaint:</strong> {order.reason || 'Item mismatch flagged during physical handover.'}
                          </div>

                          {/* Video Evidence if uploaded by buyer */}
                          {order.videoUrl && (
                            <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #FECACA', background: '#000' }}>
                              <video
                                src={order.videoUrl}
                                controls
                                playsInline
                                style={{ width: '100%', maxHeight: '140px', display: 'block' }}
                              />
                              <div style={{ padding: '4px 8px', background: '#FFF1F2', fontSize: '10px', color: '#991B1B', fontWeight: 700 }}>
                                🎥 5-Second Defect Video Evidence Uploaded by Buyer
                              </div>
                            </div>
                          )}

                          {/* Existing Defense Statement or Input Form */}
                          {disputeStatementsMap[order.id] || order.merchantStatement ? (
                            <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px 10px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#991B1B', display: 'block', marginBottom: '2px' }}>
                                Your Submitted Statement to Chief Proctor:
                              </span>
                              <p style={{ fontSize: '11.5px', color: '#334155', margin: 0, fontStyle: 'italic' }}>
                                "{disputeStatementsMap[order.id] || order.merchantStatement}"
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '11px', fontWeight: 800, color: '#991B1B' }}>
                                Write Your Vendor Defense Statement:
                              </label>
                              <textarea
                                rows={2}
                                value={disputeInputMap[order.id] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDisputeInputMap((prev) => ({ ...prev, [order.id]: val }));
                                }}
                                placeholder="Explain package condition, verified item size/specs, or offer a solution..."
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '8px',
                                  border: '1px solid #FCA5A5',
                                  background: '#FFFFFF',
                                  fontSize: '11.5px',
                                  color: '#0F172A',
                                  boxSizing: 'border-box',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSubmitDefenseStatement(order.id)}
                                disabled={submittingDisputeMap[order.id]}
                                style={{
                                  alignSelf: 'flex-start',
                                  background: '#DC2626',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                {submittingDisputeMap[order.id] ? 'Submitting...' : 'Send Statement to Proctor Desk'}
                              </button>
                            </div>
                          )}

                          {order.resolutionNotes && (
                            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#1E40AF' }}>
                              <strong>Proctor Ruling Statement:</strong> {order.resolutionNotes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Integrated Official Paystack Email Receipt Action */}
                      {(() => {
                        const matchingAlert = notifications.find((n) => n.orderId === order.id);
                        if (!matchingAlert) return null;
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '2px' }}>
                            <button
                              onClick={() => {
                                setSelectedNotification(matchingAlert);
                                setIsNotificationModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid #BFDBFE',
                                background: '#EFF6FF',
                                color: '#1D4ED8',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Mail size={12} color="#2563EB" />
                              <span>View Official Paystack Receipt & Notice</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      {/* Fulfillment Protocol & Escrow Handshake Hub */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F2B5C', letterSpacing: '0.3px' }}>
              FULFILLMENT PROTOCOL & ESCROW HANDSHAKE
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              Understand how Zero-Trust Escrow releases payouts for Courier Runs vs Direct Pickups
            </div>
          </div>
          <span
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '12px',
            }}
          >
            Zero-Trust Vault Protected
          </span>
        </div>

        {/* 2-Option Mode Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {/* Option 1: Courier Run */}
          <button
            type="button"
            onClick={() => setDeliveryMode('courier')}
            style={{
              padding: '14px',
              borderRadius: '14px',
              border: '2px solid',
              borderColor: deliveryMode === 'courier' ? '#059669' : '#E2E8F0',
              background: deliveryMode === 'courier' ? '#F0FDF4' : '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                <Bike size={16} color="#059669" />
                <span>Hostel Courier Run</span>
              </div>
              <span
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                AUTOMATED FLEET
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              Student runner handles pickup & porter lodge drop. <strong>Hands-free:</strong> Runner verifies PIN at lodge.
            </div>
          </button>

          {/* Option 2: Direct Buyer Pickup */}
          <button
            type="button"
            onClick={() => setDeliveryMode('self')}
            style={{
              padding: '14px',
              borderRadius: '14px',
              border: '2px solid',
              borderColor: deliveryMode === 'self' ? '#2563EB' : '#E2E8F0',
              background: deliveryMode === 'self' ? '#EFF6FF' : '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                <UserCheck size={16} color="#2563EB" />
                <span>Direct Buyer Pickup</span>
              </div>
              <span
                style={{
                  background: '#DBEAFE',
                  color: '#1D4ED8',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                VENDOR VERIFIES PIN
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              Buyer meets you directly without a courier. Collect their <strong>4-digit PIN</strong> to release escrow.
            </div>
          </button>
        </div>

        {/* Courier Mode Explanation Card */}
        {deliveryMode === 'courier' && (
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Bike size={15} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                  Autonomous Courier Fleet Active • Hands-Free for Vendor
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Courier verifies PIN at the hostel porter desk (you do NOT need to ask or enter any PIN)
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#334155',
                lineHeight: 1.5,
                background: '#FFFFFF',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0F2B5C', marginBottom: '4px' }}>How Courier Fulfillment Works:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>A verified campus runner accepts the dispatch job and collects the package from you.</li>
                <li>The runner transports it to the buyer's hostel ground-floor porter reception desk.</li>
                <li>The student inspects the package and provides their 4-digit PIN to the <strong>courier</strong>.</li>
                <li>The courier enters the PIN on their Courier Portal, triggering automatic split payout to your primary bank account.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Direct Buyer Pickup & Self-Delivery PIN Box */}
        {deliveryMode === 'self' && (
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Lock size={15} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                  Direct Buyer Pickup & Handshake Escrow Release
                </div>
                <div style={{ fontSize: '11px', color: '#B45309' }}>
                  Only use this when the student picks up directly from you without a platform runner
                </div>
              </div>
            </div>

            {/* Explanatory Protocol Note */}
            <div
              style={{
                background: '#FEF3C7',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#92400E',
                lineHeight: 1.5,
                marginBottom: '14px',
                border: '1px solid #FDE68A',
              }}
            >
              <strong>Mandatory Protocol:</strong> Hand package to student for physical inspection. Once satisfied, ask for their confidential <strong>4-digit Handshake PIN</strong> and enter it below to release the locked Paystack escrow.
            </div>

            {/* Multiple Handshakes Queue Selector (when vendor has >= 1 active order) */}
            {pendingHandshakeOrders.length > 0 ? (
              <>
                {/* Multi-Order Tabs Selector if multiple deliveries are active */}
                {pendingHandshakeOrders.length > 1 && (
                  <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#78350F', letterSpacing: '0.4px' }}>
                        ACTIVE PICKUP QUEUE ({pendingHandshakeOrders.length} ORDERS)
                      </span>
                      <span style={{ fontSize: '10px', color: '#B45309', fontWeight: 600 }}>
                        Tap to select buyer
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '8px',
                      }}
                    >
                      {pendingHandshakeOrders.map((o: any) => {
                        const isSelected = effectiveTargetOrder?.id === o.id;
                        const orderPrice = o.price || o.itemSubtotal || o.escrowTotal || 0;
                        const buyerName = o.buyer?.name || 'Student Buyer';
                        const itemTitle = o.itemTitle || o.product?.title || 'Campus Item';
                        const orderNum = o.orderNumber || o.id;

                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              setSelectedPickupOrderId(o.id);
                              setPinError(null);
                              setPinSuccess(false);
                              setSelfDeliveryPin(['', '', '', '']);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #D97706' : '1px solid #FDE68A',
                              background: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              boxShadow: isSelected ? '0 2px 8px rgba(217, 119, 6, 0.15)' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>
                                {orderNum}
                              </span>
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  background: isSelected ? '#FEF3C7' : '#F1F5F9',
                                  color: isSelected ? '#92400E' : '#64748B',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                }}
                              >
                                {isSelected ? 'VERIFYING' : 'IN QUEUE'}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {buyerName} • {itemTitle}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669' }}>
                              ₦{orderPrice.toLocaleString()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Target Order Details Card */}
                {effectiveTargetOrder && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #FDE68A',
                      borderRadius: '14px',
                      padding: '12px 16px',
                      marginBottom: '14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 800, letterSpacing: '0.5px' }}>
                            TARGET HANDSHAKE
                          </span>
                          <span
                            style={{
                              background: '#FEF3C7',
                              color: '#B45309',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '6px',
                            }}
                          >
                            Direct Pickup
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                          {effectiveTargetOrder.orderNumber || effectiveTargetOrder.id}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>ESCROW LOCKED</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                          ₦{(effectiveTargetOrder.price || effectiveTargetOrder.itemSubtotal || effectiveTargetOrder.escrowTotal || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #FEF3C7', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                      <div style={{ color: '#475569' }}>
                        Buyer: <strong style={{ color: '#0F172A' }}>{effectiveTargetOrder.buyer?.name || 'Student Buyer'}</strong>
                        {effectiveTargetOrder.buyer?.roomNumber && ` (${effectiveTargetOrder.buyer.roomNumber})`}
                      </div>
                      <div style={{ color: '#64748B' }}>
                        {effectiveTargetOrder.itemTitle || effectiveTargetOrder.product?.title || 'Direct Pickup Item'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Digit PIN Input Boxes */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`vendor-pin-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={selfDeliveryPin[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(-1);
                        const up = [...selfDeliveryPin];
                        up[idx] = val;
                        setSelfDeliveryPin(up);
                        if (val && idx < 3) {
                          const next = document.getElementById(`vendor-pin-input-${idx + 1}`);
                          if (next) (next as HTMLInputElement).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !selfDeliveryPin[idx] && idx > 0) {
                          const prev = document.getElementById(`vendor-pin-input-${idx - 1}`);
                          if (prev) (prev as HTMLInputElement).focus();
                        }
                      }}
                      style={{
                        width: '46px',
                        height: '52px',
                        borderRadius: '12px',
                        border: '2px solid #F59E0B',
                        background: '#FFFFFF',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 800,
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>

                {pinError && (
                  <div style={{ color: '#DC2626', fontSize: '11px', marginBottom: '8px', fontWeight: 600, textAlign: 'center' }}>
                    {pinError}
                  </div>
                )}

                {pinSuccess && (
                  <div style={{ color: '#166534', background: '#DCFCE7', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>
                    ✓ PIN Verified! ₦{(effectiveTargetOrder?.price || effectiveTargetOrder?.itemSubtotal || 0).toLocaleString()} disbursed to your settlement account.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSelfDeliveryVerify}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: pinSuccess ? '#059669' : '#0F2B5C',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
                    marginBottom: '12px',
                  }}
                >
                  {pinSuccess ? <CheckCircle2 size={16} /> : <Lock size={15} />}
                  <span>
                    {pinSuccess
                      ? 'Escrow Disbursed Successfully'
                      : `Verify PIN & Release ₦${(effectiveTargetOrder?.price || effectiveTargetOrder?.itemSubtotal || 0).toLocaleString()} Escrow`}
                  </span>
                </button>
              </>
            ) : (
              /* Empty state when vendor has 0 pending pickup deliveries */
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px dashed #CBD5E1',
                  padding: '20px 16px',
                  textAlign: 'center',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px auto',
                    color: '#64748B',
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  No Pending Direct Pickups
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.5, maxWidth: '320px', margin: '0 auto 14px auto' }}>
                  When students order items with <strong>Direct Pickup</strong>, their live order and exact escrow sum will sync here dynamically.
                </div>
              </div>
            )}

            {/* Quick Test Simulation Row (handles testing any dynamic price & multiple orders) */}
            <div
              style={{
                background: '#FEF3C7',
                borderRadius: '12px',
                padding: '10px 12px',
                border: '1px solid #FDE68A',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#78350F', marginBottom: '6px' }}>
                SIMULATE ACTIVE DELIVERIES WITH CUSTOM PRICES:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleCreateTestPickupOrder(6500, 'Casio FX-991EX Calculator')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #D97706',
                    background: '#FFFFFF',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Test ₦6,500
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateTestPickupOrder(13500, 'Oxford Textbook & Lab Manual')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #D97706',
                    background: '#FFFFFF',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Test ₦13,500
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateTestPickupOrder(28000, 'Rechargeable Study Lamp & Desk Fan')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #D97706',
                    background: '#FFFFFF',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Test ₦28,000
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Catalog Management Hub & Stock Control (Option 5 & Out of Stock) */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        {/* Header & Quick Add Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={19} color="#0F2B5C" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Campus Inventory & Stock Control
              </h3>
              <span
                style={{
                  background: '#EFF6FF',
                  color: '#1E40AF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {products.length} Products
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '3px 0 0 0' }}>
              Manage active listings, adjust inventory quantities, and mark sold-out items to prevent unfulfillable orders.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: '#0F2B5C',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(15, 43, 92, 0.18)',
            }}
          >
            <Plus size={15} />
            <span>List New Item</span>
          </button>
        </div>

        {/* Catalog Action Toast Alert */}
        {catalogToast && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #6EE7B7',
              color: '#065F46',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle2 size={16} color="#059669" />
            <span>{catalogToast}</span>
          </div>
        )}

        {/* Inventory Analytics Cards (4 Summary Pills) */}
        {(() => {
          const inStockCount = products.filter((p) => p.isActive && p.stockQuantity > 0).length;
          const outOfStockCount = products.filter((p) => !p.isActive || p.stockQuantity === 0).length;
          const totalValuation = products.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 0)), 0);

          return (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                  Total Listings
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {products.length}
                </div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px' }}>
                  Across all categories
                </div>
              </div>

              <div
                style={{
                  background: '#F0FDF4',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #BBF7D0',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                  In Stock (Active)
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>
                  {inStockCount}
                </div>
                <div style={{ fontSize: '10px', color: '#166534', marginTop: '1px' }}>
                  Ready for instant order
                </div>
              </div>

              <div
                style={{
                  background: '#FEF2F2',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #FECACA',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#991B1B', fontWeight: 800, textTransform: 'uppercase' }}>
                  Out of Stock
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>
                  {outOfStockCount}
                </div>
                <div style={{ fontSize: '10px', color: '#991B1B', marginTop: '1px' }}>
                  Purchases blocked
                </div>
              </div>

              <div
                style={{
                  background: '#EFF6FF',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #BFDBFE',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase' }}>
                  Stock Valuation
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F2B5C', marginTop: '2px' }}>
                  ₦{totalValuation.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#2563EB', marginTop: '1px' }}>
                  Available inventory
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filter Tabs & Search Bar */}
        {(() => {
          const inStockCount = products.filter((p) => p.isActive && p.stockQuantity > 0).length;
          const outOfStockCount = products.filter((p) => !p.isActive || p.stockQuantity === 0).length;

          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '14px',
                paddingBottom: '10px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {[
                  { id: 'all', label: 'All Items', count: products.length },
                  { id: 'in_stock', label: 'In Stock', count: inStockCount },
                  { id: 'out_of_stock', label: 'Out of Stock', count: outOfStockCount },
                ].map((tab) => {
                  const isSelected = catalogTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCatalogTab(tab.id as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #0F2B5C' : '1px solid #E2E8F0',
                        background: isSelected ? '#0F2B5C' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{tab.label}</span>
                      <span
                        style={{
                          background: isSelected ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#64748B',
                          borderRadius: '6px',
                          padding: '0 5px',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Search */}
              <div
                style={{
                  position: 'relative',
                  minWidth: '200px',
                  flexGrow: 1,
                  maxWidth: '320px',
                }}
              >
                <Search
                  size={14}
                  color="#94A3B8"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
                <input
                  type="text"
                  className="search-input-compact"
                  placeholder="Filter by name, size, category..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  style={{
                    width: '100%',
                    paddingTop: '7px',
                    paddingBottom: '7px',
                    paddingLeft: '36px',
                    paddingRight: catalogSearch ? '28px' : '10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '11.5px',
                    outline: 'none',
                    background: '#F8FAFC',
                    boxSizing: 'border-box',
                  }}
                />
                {catalogSearch && (
                  <button
                    onClick={() => setCatalogSearch('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Product Cards List */}
        {(() => {
          const filteredCatalog = products.filter((p) => {
            const isOut = !p.isActive || p.stockQuantity === 0;
            if (catalogTab === 'in_stock' && isOut) return false;
            if (catalogTab === 'out_of_stock' && !isOut) return false;
            if (catalogSearch.trim()) {
              const q = catalogSearch.toLowerCase();
              return (
                p.title.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.sizeBadge && p.sizeBadge.toLowerCase().includes(q))
              );
            }
            return true;
          });

          if (filteredCatalog.length === 0) {
            return (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px dashed #CBD5E1',
                }}
              >
                <Package size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  No Products Found in this View
                </div>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  {catalogSearch
                    ? `No listings match "${catalogSearch}". Try a different search term.`
                    : catalogTab === 'out_of_stock'
                    ? 'Great news! None of your items are currently sold out.'
                    : 'List a new item to get started on the campus marketplace.'}
                </p>
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCatalog.map((p) => {
                const isInStock = p.isActive && p.stockQuantity > 0;
                const isActionBusy = productActionLoading === p.id;

                const getGraphicType = (title: string, category: string): 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks' => {
                  const lower = `${title} ${category}`.toLowerCase();
                  if (lower.includes('nike') || lower.includes('shoe') || lower.includes('kick')) return 'sneaker';
                  if (lower.includes('charge') || lower.includes('gadget') || lower.includes('power')) return 'charger';
                  if (lower.includes('food') || lower.includes('asun') || lower.includes('meat')) return 'food';
                  if (lower.includes('sock')) return 'socks';
                  return 'jacket';
                };

                return (
                  <div
                    key={p.id}
                    style={{
                      borderRadius: '14px',
                      border: isInStock ? '1px solid #E2E8F0' : '1.5px solid #FECACA',
                      background: isInStock ? '#FFFFFF' : '#FFFDFD',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      opacity: isActionBusy ? 0.6 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Item Details Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Thumbnail */}
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '10px',
                            background: isInStock ? '#F8FAFC' : '#FEF2F2',
                            border: isInStock ? '1px solid #E2E8F0' : '1px solid #FCA5A5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {p.images && p.images.length > 0 && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ProductGraphic type={getGraphicType(p.title, p.category)} size={38} />
                          )}
                        </div>

                        {/* Text Info */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                              {p.title}
                            </span>
                            {p.sizeBadge && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  background: '#EFF6FF',
                                  color: '#1E40AF',
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                }}
                              >
                                {p.sizeBadge}
                              </span>
                            )}
                            {p.comboBadge && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  background: '#F5F3FF',
                                  color: '#6D28D9',
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                }}
                              >
                                {p.comboBadge}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>Condition: <strong style={{ color: '#334155' }}>{p.condition.replace('_', ' ')}</strong></span>
                            <span>•</span>
                            <span>Category: <strong style={{ color: '#334155' }}>{p.category}</strong></span>
                            <span>•</span>
                            <span style={{ color: '#2563EB' }}>📍 {p.hostelName || 'Joshua Hall'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Status Badge */}
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F2B5C' }}>
                          ₦{p.price.toLocaleString()}
                        </div>
                        {isInStock ? (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#DCFCE7',
                              color: '#166534',
                              border: '1px solid #BBF7D0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
                            IN STOCK ({p.stockQuantity} units)
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#FEE2E2',
                              color: '#991B1B',
                              border: '1px solid #FECACA',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }}></span>
                            OUT OF STOCK
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Inventory Controls Bar */}
                    <div
                      style={{
                        paddingTop: '10px',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      {/* Left: Stock Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                          Stock Units:
                        </span>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            background: '#F8FAFC',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => handleAdjustStock(p, -1)}
                            disabled={p.stockQuantity <= 0 || isActionBusy}
                            style={{
                              padding: '4px 8px',
                              border: 'none',
                              background: 'transparent',
                              cursor: p.stockQuantity <= 0 ? 'not-allowed' : 'pointer',
                              color: p.stockQuantity <= 0 ? '#CBD5E1' : '#0F2B5C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Decrease Stock"
                          >
                            <Minus size={13} />
                          </button>

                          <span
                            style={{
                              padding: '0 8px',
                              fontSize: '12px',
                              fontWeight: 800,
                              color: isInStock ? '#0F172A' : '#DC2626',
                              minWidth: '22px',
                              textAlign: 'center',
                            }}
                          >
                            {p.stockQuantity}
                          </span>

                          <button
                            onClick={() => handleAdjustStock(p, 1)}
                            disabled={isActionBusy}
                            style={{
                              padding: '4px 8px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#0F2B5C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Increase Stock"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Right: Quick In/Out Toggle & Edit Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* 1-Tap Out of Stock Toggle Button */}
                        <button
                          onClick={() => handleToggleStock(p)}
                          disabled={isActionBusy}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: isInStock ? '1px solid #FECDD3' : '1px solid #A7F3D0',
                            background: isInStock ? '#FFF1F2' : '#ECFDF5',
                            color: isInStock ? '#BE123C' : '#047857',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isInStock ? (
                            <>
                              <X size={13} />
                              <span>Mark Out of Stock</span>
                            </>
                          ) : (
                            <>
                              <Check size={13} />
                              <span>Restore to In-Stock</span>
                            </>
                          )}
                        </button>

                        {/* Quick Price Edit Button */}
                        <button
                          onClick={() => handleOpenPriceModal(p)}
                          disabled={isActionBusy}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#334155',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit3 size={12} color="#0F2B5C" />
                          <span>Edit Price</span>
                        </button>

                        {/* Delete Listing Button */}
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          disabled={isActionBusy}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: '1px solid #FEE2E2',
                            background: '#FFFFFF',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Quick Price Edit Modal */}
      {isPriceModalOpen && editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '22px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={16} color="#0F2B5C" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Update Selling Price
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPriceModalOpen(false);
                  setEditingProduct(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
              Updating listing price for <strong style={{ color: '#0F172A' }}>{editingProduct.title}</strong>
            </div>

            <form onSubmit={handleSavePrice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  NEW PRICE (₦)
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#64748B',
                    }}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    step="100"
                    min="100"
                    value={editPriceInput}
                    onChange={(e) => setEditPriceInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 30px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '15px',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPriceModalOpen(false);
                    setEditingProduct(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productActionLoading === editingProduct.id}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0F2B5C',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {productActionLoading === editingProduct.id ? 'Saving...' : 'Save Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal (Comprehensive Campus Vendor Listing Studio) */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 250,
            padding: isMobile ? '10px' : '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: isMobile ? '20px' : '24px',
              maxWidth: '660px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #F1F5F9',
                background: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.4px',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={11} color="#2563EB" />
                      RUN Flagship Listing Studio
                    </span>
                    {images.length > 0 && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                        ● {images.length} photo{images.length > 1 ? 's' : ''} ready
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    List New Campus Item
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Safe escrow settlement & ground-floor porter lodge dispatch
                  </p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                    transition: 'all 0.15s ease',
                  }}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Switcher: Edit Details vs Live Buyer Preview */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  background: '#F1F5F9',
                  padding: '4px',
                  borderRadius: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveModalTab('details')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeModalTab === 'details' ? '#FFFFFF' : 'transparent',
                    color: activeModalTab === 'details' ? '#0F2B5C' : '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    boxShadow: activeModalTab === 'details' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Edit3 size={14} />
                  <span>1. Item Details & Photos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('preview')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeModalTab === 'preview' ? '#FFFFFF' : 'transparent',
                    color: activeModalTab === 'preview' ? '#0F2B5C' : '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    boxShadow: activeModalTab === 'preview' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Eye size={14} />
                  <span>2. Live Marketplace Preview</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '22px' }}>
              {activeModalTab === 'details' ? (
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* SECTION 1: Product Photos & Gallery */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '16px',
                      border: '1.5px solid #E2E8F0',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={16} color="#2563EB" />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.4px' }}>
                          PRODUCT PHOTOS & SHOWCASE
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        {images.length} photo{images.length !== 1 ? 's' : ''} added
                      </span>
                    </div>

                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      Add clear photos from your phone camera, device files, or pick a campus preset. The first image is your main marketplace cover photo.
                    </p>

                    {/* Upload Drop Zone & Action Buttons */}
                    <div
                      style={{
                        border: '1.5px dashed #93C5FD',
                        borderRadius: '14px',
                        background: '#FFFFFF',
                        padding: '16px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <UploadCloud size={24} color="#2563EB" />
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 750, color: '#0F172A' }}>
                          Upload real pictures of what you're selling
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          Supports PNG, JPG, JPEG, WebP • Instant client-side preview
                        </div>
                      </div>

                      {/* Hidden File Inputs */}
                      <input
                        id="product-photo-file-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        style={{ display: 'none' }}
                      />
                      <input
                        id="product-photo-camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageFileUpload}
                        style={{ display: 'none' }}
                      />

                      {/* Tactile Action Buttons Row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        <label
                          htmlFor="product-photo-file-input"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#0F2B5C',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 750,
                            padding: '8px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(15, 43, 92, 0.15)',
                          }}
                        >
                          <ImageIcon size={14} />
                          <span>Choose Photos</span>
                        </label>

                        <label
                          htmlFor="product-photo-camera-input"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            fontSize: '12px',
                            fontWeight: 750,
                            padding: '8px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          <Camera size={14} />
                          <span>Snap with Camera</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#F8FAFC',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '8px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{isUrlInputOpen ? 'Hide URL' : '🔗 Paste URL'}</span>
                        </button>
                      </div>

                      {/* Direct Image URL Form */}
                      {isUrlInputOpen && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            width: '100%',
                            maxWidth: '460px',
                            marginTop: '8px',
                          }}
                        >
                          <input
                            type="url"
                            placeholder="https://example.com/item-photo.jpg"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '12px',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 750,
                              cursor: 'pointer',
                            }}
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Demo Preset Photos */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 750, color: '#475569', marginBottom: '6px' }}>
                        Or pick high-res campus demo photos:
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        {CAMPUS_PRODUCT_PHOTO_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleAddPresetImage(preset.url)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{preset.icon}</span>
                            <span>{preset.name}</span>
                            <span style={{ fontSize: '12px', color: '#2563EB' }}>+</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Thumbnail Gallery Strip */}
                    {images.length > 0 && (
                      <div style={{ marginTop: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 750, color: '#0F172A' }}>
                            Attached Gallery ({images.length})
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                            Click image to set as cover photo
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            overflowX: 'auto',
                            paddingBottom: '6px',
                          }}
                        >
                          {images.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSetCoverImage(idx)}
                              style={{
                                position: 'relative',
                                width: '80px',
                                height: '80px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: idx === 0 ? '2.5px solid #2563EB' : '1px solid #CBD5E1',
                                flexShrink: 0,
                                cursor: 'pointer',
                                background: '#E2E8F0',
                              }}
                              title={idx === 0 ? 'Primary cover photo' : 'Click to make cover photo'}
                            >
                              <img
                                src={imgUrl}
                                alt={`Item photo ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />

                              {/* Cover Badge */}
                              {idx === 0 && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: '3px',
                                    left: '3px',
                                    right: '3px',
                                    background: '#2563EB',
                                    color: '#FFFFFF',
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    padding: '1.5px 0',
                                    borderRadius: '4px',
                                    letterSpacing: '0.3px',
                                  }}
                                >
                                  ★ COVER
                                </span>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(idx);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: '3px',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                title="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: Basic Item Details */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      ITEM TITLE <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nike Air Force 1 '07 Low (Triple White)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Category & Condition Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '5px' }}>
                        CATEGORY <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: '#FFFFFF',
                          color: '#0F172A',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="shoes">👟 Shoes & Kicks</option>
                        <option value="thrift">👕 Thrift & Fashion</option>
                        <option value="food">🍖 Hot Food & Buttery</option>
                        <option value="tech">🔌 Gadgets & Chargers</option>
                        <option value="academics">📚 Solved Notes & Exams</option>
                        <option value="clothing">🧥 Campus Hoodies & Fits</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '5px' }}>
                        CONDITION <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: '#FFFFFF',
                          color: '#0F172A',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="brand_new">✨ Brand New (In Box / Sealed)</option>
                        <option value="like_new">👌 Clean Thrift (Grade 1 / Like New)</option>
                        <option value="good">👍 Gently Used (Good Condition)</option>
                        <option value="freshly_cooked">🍲 Freshly Cooked (Hot Meal)</option>
                      </select>
                    </div>
                  </div>

                  {/* SECTION 3: Campus Dispatch Hall (Crucial for RUN Runners) */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '5px' }}>
                      CAMPUS DISPATCH LOCATION <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={hostelName}
                        onChange={(e) => setHostelName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 34px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: '#FFFFFF',
                          color: '#0F172A',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {(hostels.length > 0 ? hostels : [
                          { id: '1', name: 'Queen Esther Hall' },
                          { id: '2', name: 'Deborah Hall' },
                          { id: '3', name: 'Guest House' },
                          { id: '4', name: 'Dorcas Hall' },
                          { id: '5', name: 'Prophet Moses Hall' },
                          { id: '6', name: 'Joshua Hall' },
                          { id: '7', name: 'Peter Hostel' },
                        ]).map((h: any) => (
                          <option key={h.id || h.name} value={h.name}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                      <MapPin
                        size={15}
                        color="#2563EB"
                        style={{
                          position: 'absolute',
                          left: '11px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Runners will pick up packages at the ground-floor porter lodge of this hall.
                    </div>
                  </div>

                  {/* SECTION 4: Pricing, Compare-At Discount & Stock */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      padding: '14px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr 0.8fr', gap: '10px' }}>
                      {/* Selling Price */}
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          SELLING PRICE (₦) <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="100"
                          step="100"
                          placeholder="18500"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '14px',
                            fontWeight: 750,
                            color: '#0F2B5C',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      {/* Original / Compare-At Price */}
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 750, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                          ORIGINAL PRICE (₦) <span style={{ fontSize: '10px', color: '#94A3B8' }}>(Optional)</span>
                        </label>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          placeholder="22000"
                          value={compareAtPrice}
                          onChange={(e) => setCompareAtPrice(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '14px',
                            color: '#64748B',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      {/* Stock Quantity Stepper */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155' }}>
                            STOCK QTY
                          </label>
                          <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                            {parseInt(stockQuantity || '0', 10) > 0 ? `${stockQuantity} units` : 'Out of Stock'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseInt(stockQuantity || '0', 10);
                              const safe = isNaN(curr) ? 0 : curr;
                              setStockQuantity(Math.max(0, safe - 1).toString());
                            }}
                            style={{
                              width: '38px',
                              height: '42px',
                              borderRadius: '8px',
                              border: '1.5px solid #CBD5E1',
                              background: '#F1F5F9',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#334155',
                              transition: 'all 0.15s ease',
                            }}
                            title="Decrease stock"
                          >
                            <Minus size={15} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={stockQuantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setStockQuantity('');
                              } else {
                                const parsed = parseInt(val, 10);
                                if (!isNaN(parsed)) {
                                  setStockQuantity(Math.max(0, parsed).toString());
                                }
                              }
                            }}
                            onBlur={() => {
                              if (!stockQuantity || isNaN(parseInt(stockQuantity, 10))) {
                                setStockQuantity('1');
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: '55px',
                              height: '42px',
                              textAlign: 'center',
                              borderRadius: '8px',
                              border: '1.5px solid #CBD5E1',
                              fontSize: '14px',
                              fontWeight: 800,
                              color: '#0F2B5C',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseInt(stockQuantity || '0', 10);
                              const safe = isNaN(curr) ? 0 : curr;
                              setStockQuantity((safe + 1).toString());
                            }}
                            style={{
                              width: '38px',
                              height: '42px',
                              borderRadius: '8px',
                              border: '1.5px solid #CBD5E1',
                              background: '#F1F5F9',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#334155',
                              transition: 'all 0.15s ease',
                            }}
                            title="Increase stock"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        {/* Quick stock preset chips */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          {['1', '3', '5', '10', '25'].map((qty) => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => setStockQuantity(qty)}
                              style={{
                                flex: 1,
                                padding: '3px 0',
                                borderRadius: '6px',
                                border: stockQuantity === qty ? '1px solid #2563EB' : '1px solid #E2E8F0',
                                background: stockQuantity === qty ? '#EFF6FF' : '#FFFFFF',
                                color: stockQuantity === qty ? '#1D4ED8' : '#64748B',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              {qty}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Calculated Savings Badge */}
                    {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price || '0') && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          fontSize: '11.5px',
                          fontWeight: 750,
                          padding: '3px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        <span>🎉 Active Discount:</span>
                        <span>Save ₦{(parseFloat(compareAtPrice) - parseFloat(price || '0')).toLocaleString()}</span>
                        <span>({Math.round(((parseFloat(compareAtPrice) - parseFloat(price || '0')) / parseFloat(compareAtPrice)) * 100)}% OFF)</span>
                      </div>
                    )}
                  </div>

                  {/* SECTION 5: Size & Variant Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    {/* Size Badge */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        SIZE / SPECIFICATION BADGE
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Size 43, Large, Pack of 3"
                        value={sizeBadge}
                        onChange={(e) => setSizeBadge(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '12.5px',
                          boxSizing: 'border-box',
                        }}
                      />
                      {/* Quick Size Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {['Size 41', 'Size 42', 'Size 43', 'Size 44', 'Medium', 'Large', 'Pack of 3'].map((sz) => (
                          <span
                            key={sz}
                            onClick={() => setSizeBadge(sz)}
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: sizeBadge === sz ? '#0F2B5C' : '#F1F5F9',
                              color: sizeBadge === sz ? '#FFFFFF' : '#475569',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Combo / Highlight Tag */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        HIGHLIGHT / COMBO BADGE
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Combo Deal, Free Extra Laces"
                        value={comboBadge}
                        onChange={(e) => setComboBadge(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '12.5px',
                          boxSizing: 'border-box',
                        }}
                      />
                      {/* Quick Combo Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {['Combo Deal', 'Original Box', 'Extra Laces', 'Grade 1 Thrift', 'Exam Solved'].map((cb) => (
                          <span
                            key={cb}
                            onClick={() => setComboBadge(cb)}
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: comboBadge === cb ? '#7C3AED' : '#F5F3FF',
                              color: comboBadge === cb ? '#FFFFFF' : '#7C3AED',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {cb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6: Description & Delivery Notes */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      ITEM DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mention authentic brand details, sizing fit, condition, what's included in the package..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 750, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      RUNNER DISPATCH & HANDOFF NOTES <span style={{ fontSize: '10px', color: '#94A3B8' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Package ready for runner pickup between 4pm - 8pm at ground-floor desk"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {formError && (
                    <div
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#B91C1C',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      ⚠️ {formError}
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('preview')}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#0F2B5C',
                        fontSize: '13px',
                        fontWeight: 750,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={15} />
                      <span>Preview</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#0F2B5C',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(15, 43, 92, 0.2)',
                      }}
                    >
                      {loading
                        ? 'Publishing...'
                        : `Publish Listing: ₦${parseFloat(price || '0').toLocaleString()}`}
                    </button>
                  </div>
                </form>
              ) : (
                /* SECTION: LIVE MARKETPLACE CARD PREVIEW TAB */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#1E3A8A',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Eye size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Buyer Live Preview:</strong> This is the exact interactive card student buyers will see in the RUN Marketplace feed.
                    </span>
                  </div>

                  {/* Rendered Card Box */}
                  <div
                    style={{
                      maxWidth: '340px',
                      margin: '0 auto',
                      width: '100%',
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      padding: '14px',
                      boxShadow: '0 8px 24px rgba(15, 43, 92, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Image Box */}
                    <div
                      style={{
                        height: '160px',
                        borderRadius: '14px',
                        background: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        marginBottom: '10px',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={title || 'Item preview'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <ProductGraphic type={getPreviewGraphicType(title, category)} size={95} />
                      )}

                      {/* Condition Chip */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: '#059669',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {condition.replace('_', ' ')}
                      </span>

                      {/* Discount Tag */}
                      {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price || '0') && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#EF4444',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 7px',
                            borderRadius: '9999px',
                          }}
                        >
                          -{Math.round(((parseFloat(compareAtPrice) - parseFloat(price || '0')) / parseFloat(compareAtPrice)) * 100)}%
                        </span>
                      )}

                      {/* Stock Pill */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(15, 43, 92, 0.85)',
                          color: '#FFFFFF',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '9999px',
                        }}
                      >
                        📦 {stockQuantity || 1} In Stock
                      </span>
                    </div>

                    {/* Badges Row */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {sizeBadge && (
                        <span
                          style={{
                            background: '#FEF3C7',
                            color: '#D97706',
                            fontSize: '10.5px',
                            fontWeight: 750,
                            padding: '2px 7px',
                            borderRadius: '6px',
                          }}
                        >
                          {sizeBadge}
                        </span>
                      )}
                      {comboBadge && (
                        <span
                          style={{
                            background: '#EDE9FE',
                            color: '#7C3AED',
                            fontSize: '10.5px',
                            fontWeight: 750,
                            padding: '2px 7px',
                            borderRadius: '6px',
                          }}
                        >
                          {comboBadge}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0F172A',
                        lineHeight: 1.35,
                        marginBottom: '4px',
                      }}
                    >
                      {title || 'Nike Air Force 1 Low (Triple White)'}
                    </div>

                    {/* Description Subtitle */}
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: '#64748B',
                        lineHeight: 1.4,
                        marginBottom: '10px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {description || 'Brand new in box with extra laces. Safe porter lodge dispatch.'}
                    </div>

                    {/* Hostel Location */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        color: '#64748B',
                        marginBottom: '12px',
                      }}
                    >
                      <MapPin size={13} color="#2563EB" />
                      <span>{hostelName}</span>
                    </div>

                    {/* Price & Action */}
                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2B5C' }}>
                          ₦{parseFloat(price || '18500').toLocaleString()}
                        </div>
                        {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price || '0') && (
                          <div style={{ fontSize: '11.5px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₦{parseFloat(compareAtPrice).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0F2B5C',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 750,
                          cursor: 'default',
                        }}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>

                  {/* Actions to toggle back or publish */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('details')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#334155',
                        fontSize: '13px',
                        fontWeight: 750,
                        cursor: 'pointer',
                      }}
                    >
                      ← Back to Edit Details
                    </button>

                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={loading}
                      style={{
                        flex: 1.5,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#0F2B5C',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(15, 43, 92, 0.2)',
                      }}
                    >
                      {loading ? 'Publishing...' : 'Looks Great, Publish Now!'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Settlement Account Modal */}
      {isAddAccountModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 20px',
                background: '#0F2B5C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={18} color="#FBBF24" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    Link Settlement Account
                  </h3>
                  <p style={{ fontSize: '11px', color: '#93C5FD', margin: '2px 0 0 0' }}>
                    Receive automated Paystack escrow payouts for completed orders
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAccountSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {accountFormError && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} color="#DC2626" />
                  <span>{accountFormError}</span>
                </div>
              )}

              {/* Bank Selection */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  SELECT BANK OR FINTECH
                </label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#F8FAFC',
                    color: '#0F172A',
                  }}
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Other Commercial Bank">Other Commercial Bank</option>
                </select>
              </div>

              {/* NUBAN Account Number */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    10-DIGIT NUBAN ACCOUNT NUMBER
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: newAccountNumber.length === 10 ? '#059669' : '#94A3B8',
                    }}
                  >
                    {newAccountNumber.length}/10 digits
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. 8023456789"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: newAccountNumber.length === 10 ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: '#0F172A',
                  }}
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  VERIFIED ACCOUNT HOLDER NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TUNDE AYOMIDE AKINOLA"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                />
                <p style={{ fontSize: '10px', color: '#64748B', marginTop: '3px', margin: 0 }}>
                  Must match the name registered with your BVN / Bank.
                </p>
              </div>

              {/* Checkbox: Make Primary */}
              <div
                onClick={() => setNewIsPrimary(!newIsPrimary)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: newIsPrimary ? '#F0FDF4' : '#F8FAFC',
                  border: newIsPrimary ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={newIsPrimary}
                  onChange={(e) => setNewIsPrimary(e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    Set as Primary Settlement Destination
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px' }}>
                    Completed orders will immediately credit this account upon PIN verification.
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAccount}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0F2B5C',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: submittingAccount ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(15, 43, 92, 0.25)',
                  }}
                >
                  {submittingAccount ? 'Linking Account...' : 'Link & Verify Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Notifications & Payout Receipt Inbox Modal */}
      {isNotificationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 250,
            padding: isMobile ? '8px' : '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: isMobile ? '16px' : '24px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: isMobile ? '94vh' : '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: isMobile ? '12px 16px' : '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0F2B5C',
                color: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: isMobile ? '30px' : '36px',
                    height: isMobile ? '30px' : '36px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Mail size={isMobile ? 15 : 18} color="#FBBF24" />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '13.5px' : '16px', fontWeight: 800, margin: 0 }}>
                    Vendor Email Alerts & Receipts
                  </h3>
                  <p style={{ fontSize: isMobile ? '10px' : '11px', color: '#93C5FD', margin: 0, marginTop: '2px' }}>
                    {isMobile
                      ? 'Automated Paystack settlement receipts & dispatch alerts'
                      : 'Automated transactional emails dispatched for transit, porter arrival, payouts, and refunds'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNotificationModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Split view on desktop, master-detail on mobile */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(280px, 340px) 1fr',
                flex: 1,
                overflow: 'hidden',
                minHeight: isMobile ? '380px' : '440px',
              }}
            >
              {/* Left Column: List of Notifications (Hidden on mobile if a notification is selected) */}
              <div
                style={{
                  borderRight: isMobile ? 'none' : '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  overflowY: 'auto',
                  display: isMobile && selectedNotification ? 'none' : 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#64748B',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>INBOX ({notifications.length})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        style={{
                          padding: '3px 8px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Clear All
                      </button>
                    )}
                    <span>OPay Live Sync</span>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8' }}>
                    <Mail size={28} style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ fontSize: '12px', fontWeight: 600 }}>No email notifications yet</p>
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>
                      Emails will trigger when orders change status (in-transit, porter desk, completed, refunded).
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((notif) => {
                      const isSelected = selectedNotification?.id === notif.id;
                      const isCompleted = notif.type === 'payment_completed';
                      const isTransit = notif.type === 'in_transit';
                      const isPorter = notif.type === 'at_porter_desk';

                      return (
                        <div
                          key={notif.id}
                          onClick={() => setSelectedNotification(notif)}
                          style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid #E2E8F0',
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            cursor: 'pointer',
                            borderLeft: isSelected ? '4px solid #0F2B5C' : '4px solid transparent',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isCompleted
                                  ? '#DCFCE7'
                                  : isTransit
                                  ? '#FEF3C7'
                                  : isPorter
                                  ? '#E0E7FF'
                                  : '#FEE2E2',
                                color: isCompleted
                                  ? '#166534'
                                  : isTransit
                                  ? '#92400E'
                                  : isPorter
                                  ? '#3730A3'
                                  : '#991B1B',
                              }}
                            >
                              {isCompleted
                                ? 'PAYOUT RECEIPT'
                                : isTransit
                                ? 'IN TRANSIT'
                                : isPorter
                                ? 'PORTER DESK'
                                : 'REFUND ALERT'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                              {new Date(notif.createdAt).toLocaleTimeString('en-NG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isSelected ? '#0F2B5C' : '#1E293B',
                              marginBottom: '2px',
                              lineHeight: '1.3',
                            }}
                          >
                            {notif.subject}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: '#64748B',
                              marginTop: '2px',
                            }}
                          >
                            <span>Order {notif.orderId}</span>
                            {isMobile && (
                              <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 700 }}>
                                View Receipt →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Selected Email Preview (Full width on mobile when selected, hidden when viewing inbox list) */}
              <div
                style={{
                  padding: isMobile ? '16px' : '20px',
                  overflowY: 'auto',
                  background: '#FFFFFF',
                  display: isMobile && !selectedNotification ? 'none' : 'flex',
                  flexDirection: 'column',
                }}
              >
                {selectedNotification ? (
                  <div>
                    {/* Mobile Back to Inbox Button */}
                    {isMobile && (
                      <button
                        onClick={() => setSelectedNotification(null)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          marginBottom: '14px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: '#F1F5F9',
                          color: '#0F2B5C',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        ← Back to All Alerts ({notifications.length})
                      </button>
                    )}

                    {/* Email Headers */}
                    <div
                      style={{
                        paddingBottom: '14px',
                        marginBottom: '16px',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={16} color="#059669" />
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                            SECURE UNIHIVE TRANSACTION NOTIFICATION
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          {new Date(selectedNotification.createdAt).toLocaleString('en-NG')}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                        {selectedNotification.subject}
                      </h2>

                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div>
                          <strong>From:</strong> UniHive Escrow System &lt;notifications@unihive.campus&gt;
                        </div>
                        <div>
                          <strong>To:</strong> {selectedNotification.recipientEmail} (Merchant Subaccount)
                        </div>
                        <div>
                          <strong>Order ID:</strong>{' '}
                          <code style={{ background: '#F1F5F9', padding: '1px 4px', borderRadius: '4px', color: '#0F2B5C' }}>
                            {selectedNotification.orderId}
                          </code>
                        </div>
                        {selectedNotification.metadata?.transferCode && (
                          <div>
                            <strong>Paystack Transfer Code:</strong>{' '}
                            <code style={{ background: '#DCFCE7', padding: '1px 4px', borderRadius: '4px', color: '#166534', fontWeight: 700 }}>
                              {selectedNotification.metadata.transferCode}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email HTML / Plaintext Card */}
                    <div
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        padding: '16px',
                        background: '#FAFAFA',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      {selectedNotification.htmlBody ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedNotification.htmlBody }}
                          style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                          }}
                        />
                      ) : (
                        <pre
                          style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#334155',
                            margin: 0,
                          }}
                        >
                          {selectedNotification.body}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#94A3B8',
                      textAlign: 'center',
                    }}
                  >
                    <Mail size={40} style={{ marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                      Select an Email Notification
                    </div>
                    <p style={{ fontSize: '12px', maxWidth: '300px', marginTop: '4px' }}>
                      Choose any email alert from the left column to preview the complete customer or payout notice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
