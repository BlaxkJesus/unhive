import React, { useState, useEffect } from 'react';
import { useCampus } from '../../context/CampusContext';
import { useResponsive } from '../../hooks/useResponsive';
import type { Product } from '../../types';
import { API } from '../../config/api';
import { ShieldCheck, MapPin, Tag, ShoppingBag, Search, CheckCircle2, X, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ProductGraphic } from '../../components/common/ProductGraphic';

interface MarketplaceHomeProps {
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const MarketplaceHome: React.FC<MarketplaceHomeProps> = ({
  onSelectProduct,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentCampus, hostels } = useCampus();
  const { isMobile } = useResponsive();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHostels, setSelectedHostels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'thrift', label: 'Thrift & Fits' },
    { id: 'food', label: 'Food & Drinks' },
    { id: 'tech', label: 'Gadgets & Tech' },
    { id: 'academics', label: 'Past Questions' },
  ];

  useEffect(() => {
    async function loadProducts() {
      if (!currentCampus) return;
      setLoading(true);
      try {
        const res = await API.getProducts({
          campusId: currentCampus.id,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
        });
        if (res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.warn('Network request failed, utilizing campus catalog fallback', err);
        if (currentCampus.id === 'campus-run-ede') {
          const now = new Date().toISOString();
          setProducts([
            {
              id: 'prod-run-nike-af1',
              vendorId: 'vendor-tunde-kicks-run',
              campusId: 'campus-run-ede',
              hostelName: 'Queen Esther Hall',
              title: "Nike Air Force 1 '07 Low (Triple White)",
              description: 'Fresh UK-grade kicks. Original box included, crisp soles, zero crease. Available for hostel pickup or runner batch delivery.',
              price: 18500,
              category: 'shoes',
              condition: 'Brand New',
              stockQuantity: 4,
              isActive: true,
              images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'],
              createdAt: now,
              vendor: {
                id: 'vendor-tunde-kicks-run',
                businessName: 'Tunde Kicks & Thrift',
                trustScore: 4.95,
              },
            },
            {
              id: 'prod-run-oraimo-65w',
              vendorId: 'vendor-tunde-kicks-run',
              campusId: 'campus-run-ede',
              hostelName: 'Joshua Hall',
              title: 'Oraimo 65W GaN Fast Charger + 100W Cable',
              description: 'Superfast charging for laptops, MacBooks, iPhones & Samsungs. 1-year warranty receipt included.',
              price: 12000,
              category: 'tech',
              condition: 'Brand New',
              stockQuantity: 8,
              isActive: true,
              images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'],
              createdAt: now,
              vendor: {
                id: 'vendor-tunde-kicks-run',
                businessName: 'Tunde Kicks & Thrift',
                trustScore: 4.95,
              },
            },
            {
              id: 'prod-run-varsity-hoodie',
              vendorId: 'vendor-tunde-kicks-run',
              campusId: 'campus-run-ede',
              hostelName: 'Queen Esther Hall',
              title: 'RUN Varsity Heavyweight Oversized Hoodie (Forest Green)',
              description: 'Official Redeemer’s University heavyweight cotton fleece. Screen-printed emblem, ribbed cuffs.',
              price: 9500,
              category: 'thrift',
              condition: 'Like New',
              stockQuantity: 12,
              isActive: true,
              images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'],
              createdAt: now,
              vendor: {
                id: 'vendor-tunde-kicks-run',
                businessName: 'Tunde Kicks & Thrift',
                trustScore: 4.95,
              },
            },
            {
              id: 'prod-run-grilled-asun',
              vendorId: 'vendor-tunde-kicks-run',
              campusId: 'campus-run-ede',
              hostelName: 'Joshua Hall',
              title: 'Spicy Peppered Goat Meat Asun (Full Takeaway Pack)',
              description: 'Freshly smoked, peppered to perfection with roasted onions. Delivered warm to Queen Esther or Joshua porter desk.',
              price: 3500,
              category: 'food',
              condition: 'Freshly Made',
              stockQuantity: 20,
              isActive: true,
              images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'],
              createdAt: now,
              vendor: {
                id: 'vendor-tunde-kicks-run',
                businessName: 'Tunde Kicks & Thrift',
                trustScore: 4.95,
              },
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [currentCampus, selectedCategory, searchQuery]);

  const toggleHostel = (hostelId: string) => {
    if (selectedHostels.includes(hostelId)) {
      setSelectedHostels(selectedHostels.filter((id) => id !== hostelId));
    } else {
      setSelectedHostels([...selectedHostels, hostelId]);
    }
  };

  const getProductGraphicType = (title: string, category: string): 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks' => {
    const lower = `${title} ${category}`.toLowerCase();
    if (lower.includes('nike') || lower.includes('shoe') || lower.includes('kick')) return 'sneaker';
    if (lower.includes('charge') || lower.includes('gadget') || lower.includes('power')) return 'charger';
    if (lower.includes('food') || lower.includes('asun') || lower.includes('jollof') || lower.includes('pot')) return 'food';
    if (lower.includes('sock')) return 'socks';
    return 'jacket';
  };

  // -------------------------------------------------------------
  // MOBILE / PWA VIEW (Matching 01_Screen_1_Home_Feed.png)
  // -------------------------------------------------------------
  if (isMobile) {
    return (
      <div style={{ padding: '16px 16px 36px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Mobile Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          <input
            type="text"
            className="search-input"
            placeholder="Search sneakers, hoodies, buttery food, chargers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '48px',
              paddingRight: searchQuery ? '42px' : '16px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                zIndex: 2,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Campus Escrow Assurance Banner */}
        <div
          style={{
            background: '#0F2B5C',
            borderRadius: '14px',
            padding: '20px',
            color: '#FFFFFF',
            border: '1px solid #1E3A8A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={20} color="#F59E0B" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Hostel Porter Escrow Protection
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
            Payment is held in escrow until you inspect your item at the ground-floor porter desk and share your 4-digit verification code with the runner.
          </p>
        </div>

        {/* Popular Categories Scroll */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.5px' }}>
              POPULAR CATEGORIES
            </span>
            <span
              onClick={() => setSelectedCategory('all')}
              style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}
            >
              See all
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((c) => {
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: isActive ? '#0F2B5C' : '#E2E8F0',
                    background: isActive ? '#0F2B5C' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trending in RUN Halls: 2-Column Mobile Grid */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.4px' }}>
              TRENDING IN {currentCampus?.shortName || 'RUN'} HALLS
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#059669',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '3px 9px',
                borderRadius: '9999px',
              }}
            >
              ● Live listings
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '13px' }}>
              Fetching campus listings...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
              <ShoppingBag size={38} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '15px', fontWeight: 750, color: '#0F172A' }}>No listings found</div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '4px' }}>
                Try selecting a different category or search term.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {products.map((p, idx) => {
                const graphicType = getProductGraphicType(p.title, p.category);
                const isOutOfStock = !p.isActive || (typeof p.stockQuantity === 'number' && p.stockQuantity <= 0);
                const inCartQuantity = cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="card-stagger-item card-interactive"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: isOutOfStock ? '1px solid #FECACA' : '1px solid rgba(226, 232, 240, 0.85)',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 14px -2px rgba(15, 43, 92, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                      transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s ease',
                      opacity: isOutOfStock ? 0.85 : 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      animationDelay: `${Math.min(idx, 8) * 35}ms`,
                    }}
                  >
                    {/* Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span
                        style={{
                          background: isOutOfStock ? '#EF4444' : '#059669',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 750,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {isOutOfStock ? 'Sold Out' : p.condition.replace('_', ' ')}
                      </span>
                      {isOutOfStock && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444' }}>
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* Graphic Box */}
                    <div
                      style={{
                        height: '118px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F1F5F9',
                        borderRadius: '14px',
                        marginBottom: '10px',
                        border: '1px solid #E2E8F0',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {p.images && p.images.length > 0 && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <ProductGraphic type={graphicType} size={88} />
                      )}

                      {/* Floating Round Add-to-Cart Action Button */}
                      {!isOutOfStock && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p, 1);
                          }}
                          title={inCartQuantity > 0 ? `In Cart (${inCartQuantity}) • Tap to add another` : 'Add to Hive Cart'}
                          aria-label="Add to Hive Cart"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: inCartQuantity > 0 ? '#1D4ED8' : '#FFFFFF',
                            border: inCartQuantity > 0 ? '1.5px solid #1D4ED8' : '1px solid #CBD5E1',
                            color: inCartQuantity > 0 ? '#FFFFFF' : '#0F2B5C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
                            zIndex: 2,
                            padding: 0,
                          }}
                        >
                          {inCartQuantity > 0 ? (
                            <span style={{ fontSize: '11px', fontWeight: 900 }}>{inCartQuantity}</span>
                          ) : (
                            <Plus size={16} strokeWidth={2.5} />
                          )}
                        </button>
                      )}

                      {isOutOfStock && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span
                            style={{
                              background: '#EF4444',
                              color: '#FFF',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 750,
                        color: '#0F172A',
                        lineHeight: 1.38,
                        marginBottom: '4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '36px',
                      }}
                    >
                      {p.title}
                    </div>

                    {/* Vendor & Hall */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11.5px',
                        color: '#64748B',
                        marginBottom: '10px',
                      }}
                    >
                      <CheckCircle2 size={12} color="#3B82F6" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Tunde Kicks • Hall
                      </span>
                    </div>

                    {/* Price & Actions */}
                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 800,
                          color: isOutOfStock ? '#64748B' : '#0F2B5C',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        ₦{p.price.toLocaleString()}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(p);
                        }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: isOutOfStock ? '1px solid #CBD5E1' : '1px solid #BFDBFE',
                          background: isOutOfStock ? '#F1F5F9' : '#EFF6FF',
                          color: isOutOfStock ? '#64748B' : '#1D4ED8',
                          fontSize: '11.5px',
                          fontWeight: 750,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {isOutOfStock ? 'Out' : 'View'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DESKTOP VIEW (Refined Production-Grade Marketplace Dashboard)
  // -------------------------------------------------------------
  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Category Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? '#0F2B5C' : '#E2E8F0',
                background: isActive ? '#0F2B5C' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#334155',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: Filters & Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Left Sticky Proximity Filters */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#64748B',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MapPin size={14} color="#0F2B5C" />
              <span>Hostel Proximity Filter</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {hostels.map((h) => (
                <label
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedHostels.includes(h.id)}
                    onChange={() => toggleHostel(h.id)}
                    style={{ accentColor: '#0F2B5C' }}
                  />
                  <span>{h.name}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: h.gender === 'female' ? '#BE185D' : '#1D4ED8',
                      background: h.gender === 'female' ? '#FDF2F8' : '#EFF6FF',
                      border: h.gender === 'female' ? '1px solid #FCE7F3' : '1px solid #DBEAFE',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      marginLeft: 'auto',
                    }}
                  >
                    {h.gender.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#64748B',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Tag size={14} color="#0F2B5C" />
              <span>Item Condition</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#0F2B5C' }} />
                <span>Brand New (In Box)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#0F2B5C' }} />
                <span>Clean Thrift (Like New)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#0F2B5C' }} />
                <span>Freshly Cooked Food</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid (Screen 11 Widescreen) */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Trending in {currentCampus?.name || 'Campus'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                {products.length} verified listings with ground-floor porter lodge dispatch
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
              Loading campus listings...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <ShoppingBag size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>No Listings Found</h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Try selecting another category or switching to Redeemer's University (RUN) flagship.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '18px',
              }}
            >
              {products.map((p, idx) => {
                const graphicType = getProductGraphicType(p.title, p.category);
                const isOutOfStock = !p.isActive || (typeof p.stockQuantity === 'number' && p.stockQuantity <= 0);

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="card-stagger-item card-interactive"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '10px',
                      border: isOutOfStock ? '1px solid #FECACA' : '1px solid #E2E8F0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      opacity: isOutOfStock ? 0.85 : 1,
                      animationDelay: `${Math.min(idx, 8) * 35}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 18px rgba(15, 43, 92, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 43, 92, 0.04)';
                    }}
                  >
                    {/* Graphic Box */}
                    <div
                      style={{
                        position: 'relative',
                        height: '160px',
                        background: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {p.images && p.images.length > 0 && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <ProductGraphic type={graphicType} size={110} />
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: isOutOfStock ? '#EF4444' : '#059669',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        {isOutOfStock ? 'OUT OF STOCK' : p.condition.replace('_', ' ')}
                      </span>

                      {/* Floating Desktop Quick-Add Cart Badge */}
                      {!isOutOfStock && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p, 1);
                          }}
                          title={
                            (cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                              ? `In Cart (${cartItems.find((ci) => ci.product.id === p.id)?.quantity}) • Add Another`
                              : 'Add to Hive Cart'
                          }
                          aria-label="Add to Hive Cart"
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background:
                              (cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                                ? '#1D4ED8'
                                : 'rgba(255, 255, 255, 0.95)',
                            border:
                              (cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                                ? '1.5px solid #1D4ED8'
                                : '1px solid rgba(226, 232, 240, 0.95)',
                            color:
                              (cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                                ? '#FFFFFF'
                                : '#0F2B5C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
                            zIndex: 2,
                            padding: 0,
                          }}
                        >
                          {(cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0 ? (
                            <span style={{ fontSize: '11.5px', fontWeight: 900 }}>
                              {cartItems.find((ci) => ci.product.id === p.id)?.quantity}
                            </span>
                          ) : (
                            <Plus size={16} strokeWidth={2.5} />
                          )}
                        </button>
                      )}

                      <span
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: isOutOfStock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 43, 92, 0.85)',
                          color: '#FFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '9999px',
                        }}
                      >
                        {isOutOfStock ? '⚠️ Out of Stock' : `📦 ${p.stockQuantity} Left`}
                      </span>
                    </div>

                    {/* Info Body */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          marginBottom: '6px',
                          lineHeight: 1.3,
                          color: '#0F172A',
                        }}
                      >
                        {p.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B', marginBottom: '12px' }}>
                        <CheckCircle2 size={12} color="#3B82F6" />
                        <span>Tunde Kicks • Joshua Hall</span>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '16.5px', fontWeight: 800, color: isOutOfStock ? '#64748B' : '#0F2B5C', whiteSpace: 'nowrap' }}>
                            ₦{p.price.toLocaleString()}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {!isOutOfStock && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(p, 1);
                              }}
                              style={{
                                padding: '6px 11px',
                                borderRadius: '8px',
                                border: '1.5px solid #0F2B5C',
                                background:
                                  (cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                                    ? '#EFF6FF'
                                    : '#FFFFFF',
                                color:
                                  (cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                                    ? '#1D4ED8'
                                    : '#0F2B5C',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Plus size={12} strokeWidth={2.5} />
                              <span>
                                {(cartItems.find((ci) => ci.product.id === p.id)?.quantity || 0) > 0
                                  ? `Cart (${cartItems.find((ci) => ci.product.id === p.id)?.quantity})`
                                  : 'Cart'}
                              </span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectProduct(p)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: isOutOfStock ? '#E2E8F0' : '#F59E0B',
                              color: isOutOfStock ? '#94A3B8' : '#0F172A',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
