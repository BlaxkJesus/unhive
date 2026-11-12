import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { MobileBottomNav, type TabId } from '../components/common/MobileBottomNav';
import { ProductGraphic } from '../components/common/ProductGraphic';

interface SearchCategoriesProps {
  onNavigate: (screenId: string) => void;
  onSelectProduct?: (product: any) => void;
}

export const SearchCategories: React.FC<SearchCategoriesProps> = ({ onNavigate, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('Air Force 1');
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');

  const handleTabSelect = (tab: TabId) => {
    if (tab === 'home') onNavigate('01_home');
    else if (tab === 'search') onNavigate('02_search');
    else if (tab === 'orders') onNavigate('05_tracking');
    else if (tab === 'vendor') onNavigate('06_vendor');
    else if (tab === 'dispatch') onNavigate('07_dispatch');
  };

  const handleViewDetails = (item: any) => {
    if (onSelectProduct) onSelectProduct(item);
    onNavigate('03_product');
  };

  const handlePayNow = (item: any) => {
    if (onSelectProduct) onSelectProduct(item);
    onNavigate('04_checkout');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '844px',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <MobileStatusBar />

      {/* Header */}
      <div style={{ padding: '8px 20px 12px 20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F2B5C', marginBottom: '14px' }}>
          Explore RUN Market
        </div>

        {/* Search Input */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <Search size={18} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campus marketplace..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0F172A',
              padding: '0 4px',
            }}
          />
          {searchTerm && (
            <div onClick={() => setSearchTerm('')} style={{ cursor: 'pointer', padding: '2px' }}>
              <X size={16} color="#94A3B8" />
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedHostel(selectedHostel === 'All Hostels' ? 'Queen Esther' : 'All Hostels')}
            style={{
              background: '#0F2B5C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{selectedHostel}</span>
            <ChevronDown size={14} />
          </button>

          <button
            style={{
              background: '#FFFFFF',
              color: '#475569',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span>Price: Any</span>
            <ChevronDown size={14} />
          </button>

          <button
            style={{
              background: '#FFFFFF',
              color: '#475569',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Verified Only
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div
        style={{
          padding: '0 20px 10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748B',
        }}
      >
        <div>
          Showing <span style={{ fontWeight: 800, color: '#0F172A' }}>14 results</span> for "{searchTerm}"
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}>
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </div>
      </div>

      {/* Results List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Card 1 */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            gap: '14px',
            boxShadow: '0 2px 6px rgba(15, 43, 92, 0.03)',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ProductGraphic type="sneaker" size={70} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span
                style={{
                  background: '#FEF3C7',
                  color: '#D97706',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Size 43
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>₦18,500</span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              Nike Air Force 1 Low (Triple White)
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
              Brand new in box • With extra laces
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
                <MapPin size={12} color="#2563EB" />
                <span>Joshua Hall</span>
              </div>

              <button
                onClick={() =>
                  handleViewDetails({
                    id: 'p1',
                    name: "Nike Air Force 1 '07 Low (Triple White)",
                    price: 18500,
                    vendor: 'Tunde Kicks',
                    hall: 'Joshua Hall',
                    type: 'sneaker',
                  })
                }
                style={{
                  background: '#F1F5F9',
                  color: '#0F2B5C',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            gap: '14px',
            boxShadow: '0 2px 6px rgba(15, 43, 92, 0.03)',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ProductGraphic type="sneaker" size={70} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Size 41
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>₦14,000</span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              Nike AF1 '07 Black & White Swoosh
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
              Grade A Clean Thrift • Mint Sole
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
                <MapPin size={12} color="#2563EB" />
                <span>Joseph Hall</span>
              </div>

              <button
                onClick={() =>
                  handlePayNow({
                    id: 'p2-af1',
                    name: "Nike AF1 '07 Black & White Swoosh",
                    price: 14000,
                    vendor: 'ThriftKing',
                    hall: 'Joseph Hall',
                    type: 'sneaker',
                  })
                }
                style={{
                  background: '#1E3A8A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            gap: '14px',
            boxShadow: '0 2px 6px rgba(15, 43, 92, 0.03)',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ProductGraphic type="socks" size={60} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span
                style={{
                  background: '#EDE9FE',
                  color: '#7C3AED',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Combo Pack
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>₦2,500</span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              Nike Ankle Socks (Pack of 3 Pairs)
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
              Thick cotton • Sweat resistant
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
                <MapPin size={12} color="#2563EB" />
                <span>Queen Esther Hall</span>
              </div>

              <button
                onClick={() =>
                  handlePayNow({
                    id: 'p3-socks',
                    name: 'Nike Ankle Socks (Pack of 3 Pairs)',
                    price: 2500,
                    vendor: 'CampusEssentials',
                    hall: 'Queen Esther Hall',
                    type: 'socks',
                  })
                }
                style={{
                  background: '#1E3A8A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Nav */}
      <MobileBottomNav activeTab="search" onSelectTab={handleTabSelect} />
    </div>
  );
};
