import React, { useState, useEffect } from 'react';
import { useCampus } from '../../context/CampusContext';
import { API } from '../../config/api';
import type { Product } from '../../types';
import {
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Check,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { ProductGraphic } from '../../components/common/ProductGraphic';

const campusHostels = [
  { id: 'all', name: 'All Hostels' },
  { id: 'queen_esther', name: 'Queen Esther Hall' },
  { id: 'deborah', name: 'Deborah Hall' },
  { id: 'guest_house', name: 'Guest House' },
  { id: 'dorcas', name: 'Dorcas Hall' },
  { id: 'prophet_moses', name: 'Prophet Moses Hall' },
  { id: 'joshua', name: 'Joshua Hall' },
  { id: 'peter', name: 'Peter Hostel' },
];

// Price Range Presets
const priceRanges = [
  { id: 'any', label: 'Price: Any', min: undefined, max: undefined },
  { id: 'under_5k', label: 'Under ₦5,000', min: 0, max: 5000 },
  { id: '5k_15k', label: '₦5,000 - ₦15,000', min: 5000, max: 15000 },
  { id: '15k_30k', label: '₦15,000 - ₦30,000', min: 15000, max: 30000 },
  { id: 'above_30k', label: '₦30,000+', min: 30000, max: undefined },
];

interface SearchDiscoveryViewProps {
  onSelectProduct: (product: Product) => void;
  initialQuery?: string;
  onBack?: () => void;
}

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  onSelectProduct,
  initialQuery = 'Air Force 1',
  onBack,
}) => {
  const { currentCampus } = useCampus();

  // Search and Filter States
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedHostel, setSelectedHostel] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('any');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);

  // Filter Sheet / Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    async function search() {
      if (!currentCampus) return;
      setLoading(true);
      try {
        const activePrice = priceRanges.find((p) => p.id === selectedPriceRange);

        const res = await API.getProducts({
          campusId: currentCampus.id,
          search: query || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          hostelName: selectedHostel !== 'all' ? selectedHostel : undefined,
          condition: selectedCondition !== 'all' ? selectedCondition : undefined,
          minPrice: activePrice?.min,
          maxPrice: activePrice?.max,
        });

        if (res.data) {
          let list: Product[] = res.data;
          // Filter client-side verified vendors if active
          if (verifiedOnly) {
            list = list.filter((p: any) => p.vendor?.trustScore === undefined || p.vendor?.trustScore >= 4.0);
          }
          setProducts(list);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [query, currentCampus, selectedHostel, selectedPriceRange, selectedCategory, selectedCondition, verifiedOnly]);

  const getProductGraphicType = (title: string, category: string): 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks' => {
    const lower = `${title} ${category}`.toLowerCase();
    if (lower.includes('nike') || lower.includes('shoe') || lower.includes('kick') || lower.includes('af1') || lower.includes('force')) return 'sneaker';
    if (lower.includes('charge') || lower.includes('gadget') || lower.includes('power') || lower.includes('oraimo')) return 'charger';
    if (lower.includes('food') || lower.includes('asun') || lower.includes('jollof') || lower.includes('pot') || lower.includes('meat')) return 'food';
    if (lower.includes('sock')) return 'socks';
    return 'jacket';
  };

  const resetFilters = () => {
    setSelectedHostel('all');
    setSelectedPriceRange('any');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setVerifiedOnly(true);
  };

  const activeHostelLabel = campusHostels.find((h) => h.id === selectedHostel)?.name || 'All Hostels';
  const activePriceLabel = priceRanges.find((p) => p.id === selectedPriceRange)?.label || 'Price: Any';

  return (
    <div style={{ padding: '16px 16px 96px 16px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Title: Explore RUN Market (Screen 2 1:1) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F2B5C',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.3px',
            margin: 0,
          }}
        >
          Explore {currentCampus?.shortName || 'RUN'} Market
        </h1>
      </div>

      {/* Search Input Bar */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
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
          placeholder="Search sneakers, past questions, chargers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            paddingTop: '13px',
            paddingBottom: '13px',
            paddingLeft: '48px',
            paddingRight: '42px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            background: '#F1F5F9',
            fontSize: '14px',
            fontWeight: 500,
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Quick Filter Pills Row (Screen 2 1:1) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '16px',
          scrollbarWidth: 'none',
        }}
      >
        {/* Pill 1: All Hostels ▾ (Active navy filled) */}
        <button
          onClick={() => {
            setIsFilterModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0F2B5C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '12.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(15, 43, 92, 0.15)',
          }}
        >
          <span>{activeHostelLabel}</span>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>▼</span>
        </button>

        {/* Pill 2: Price: Any ▾ */}
        <button
          onClick={() => {
            setIsFilterModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: selectedPriceRange !== 'any' ? '#EFF6FF' : '#F8FAFC',
            color: selectedPriceRange !== 'any' ? '#1D4ED8' : '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '12.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <span>{activePriceLabel}</span>
          <span style={{ fontSize: '10px', color: '#64748B' }}>▼</span>
        </button>

        {/* Pill 3: Verified Only Toggle */}
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          style={{
            background: verifiedOnly ? '#EFF6FF' : '#F8FAFC',
            color: verifiedOnly ? '#1E3A8A' : '#64748B',
            border: verifiedOnly ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '12.5px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span>Verified Only</span>
        </button>
      </div>

      {/* Results Count & Filter Trigger Row (Screen 2 1:1) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          padding: '0 2px',
        }}
      >
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A' }}>{products.length} results</strong>
          {query ? ` for "${query}"` : ''}
        </div>

        <button
          onClick={() => {
            setIsFilterModalOpen(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <SlidersHorizontal size={14} color="#2563EB" />
          <span>Filters</span>
        </button>
      </div>

      {/* Product Cards Feed (Screen 2 1:1) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '13px' }}>
            Searching {currentCampus?.shortName || 'RUN'} campus listings...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              No campus listings found
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>
              Try searching for "Air Force 1", "Nike", "Charger", or reset your active filters.
            </div>
            <button
              onClick={resetFilters}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          products.map((product, idx) => {
            const graphicType = getProductGraphicType(product.title, product.category);
            const hostel = product.hostelName || 'Queen Esther Hall';
            const sizeBadge =
              product.sizeBadge ||
              (product.title.includes('Triple White')
                ? 'Size 43'
                : product.title.includes('Black & White')
                ? 'Size 41'
                : product.comboBadge || (product.category === 'shoes' ? 'Size 43' : 'Brand New'));

            // Out of stock detection
            const isOutOfStock = !product.isActive || (typeof product.stockQuantity === 'number' && product.stockQuantity <= 0);

            // Alternating CTA button as shown in design (View Details vs Pay Now)
            const isFirstItem = idx === 0;

            return (
              <div
                key={product.id}
                className="card-stagger-item card-interactive"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: isOutOfStock ? '1px solid #FECACA' : '1px solid #E2E8F0',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 2px 10px rgba(15, 43, 92, 0.03)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  opacity: isOutOfStock ? 0.85 : 1,
                  animationDelay: `${Math.min(idx, 8) * 35}ms`,
                }}
              >
                {/* Left Thumbnail Box */}
                <div
                  onClick={() => onSelectProduct(product)}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '16px',
                    background: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {product.images && product.images.length > 0 && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <ProductGraphic type={graphicType} size={70} />
                  )}
                  {isOutOfStock && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                      }}
                    >
                      <span
                        style={{
                          background: '#EF4444',
                          color: '#FFFFFF',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '3px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                        }}
                      >
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Details Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top Row: Badge + Price */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        background: isOutOfStock
                          ? '#FEE2E2'
                          : sizeBadge.includes('Combo')
                          ? '#EDE9FE'
                          : sizeBadge.includes('Brand')
                          ? '#ECFDF5'
                          : '#FEF3C7',
                        color: isOutOfStock
                          ? '#DC2626'
                          : sizeBadge.includes('Combo')
                          ? '#7C3AED'
                          : sizeBadge.includes('Brand')
                          ? '#059669'
                          : '#D97706',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2.5px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {isOutOfStock ? 'Out of Stock' : sizeBadge}
                    </span>

                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: isOutOfStock ? '#64748B' : '#0F172A',
                      }}
                    >
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      margin: '2px 0 3px 0',
                    }}
                  >
                    {product.title}
                  </div>

                  {/* Description Subtitle */}
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#64748B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '10px',
                    }}
                  >
                    {product.description || 'Brand new in box • With extra laces'}
                  </div>

                  {/* Bottom Row: Location Tag + Dual Action Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    {/* Location Tag */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <MapPin size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{hostel}</span>
                    </div>

                    {/* Action Button: Sold Out / View Details (Item 1) or Pay Now (Items 2, 3...) */}
                    {isOutOfStock ? (
                      <button
                        onClick={() => onSelectProduct(product)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: '#F1F5F9',
                          color: '#64748B',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        title="Item is out of stock - view details"
                      >
                        Out of Stock
                      </button>
                    ) : isFirstItem ? (
                      <button
                        onClick={() => onSelectProduct(product)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          background: '#F8FAFC',
                          color: '#0F2B5C',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        View Details
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectProduct(product)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0F2B5C',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FILTER BOTTOM SHEET MODAL */}
      {isFilterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px 20px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Filter {currentCampus?.shortName || 'RUN'} Marketplace
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Tailor listings across hostels, price points, and categories
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={resetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>

                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Hostel Location Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Hostel of Origin / Location
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {campusHostels.map((h) => {
                  const isSelected = selectedHostel === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHostel(h.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #0F2B5C' : '1px solid #E2E8F0',
                        background: isSelected ? '#0F2B5C' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Price Range
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {priceRanges.map((p) => {
                  const isSelected = selectedPriceRange === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPriceRange(p.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #0F2B5C' : '1px solid #E2E8F0',
                        background: isSelected ? '#0F2B5C' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'shoes', label: 'Shoes & Kicks' },
                  { id: 'electronics', label: 'Gadgets & Chargers' },
                  { id: 'fashion', label: 'Thrift & Fashion' },
                  { id: 'food', label: 'Food & Buttery' },
                  { id: 'academics', label: 'Books & Notes' },
                ].map((c) => {
                  const isSelected = selectedCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #0F2B5C' : '1px solid #E2E8F0',
                        background: isSelected ? '#0F2B5C' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verified Vendor Only Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '22px',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Verified Vendors Only
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Only show sellers with verified matric status & 4.0+ trust rating
                </div>
              </div>

              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0F2B5C', cursor: 'pointer' }}
              />
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 43, 92, 0.2)',
              }}
            >
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
