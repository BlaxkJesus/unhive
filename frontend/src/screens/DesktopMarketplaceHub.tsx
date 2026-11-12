import React, { useState } from 'react';
import { Search, ChevronDown, ShoppingBag, ShieldCheck, Star } from 'lucide-react';
import { UniHiveLogo } from '../components/common/UniHiveLogo';
import { ProductGraphic } from '../components/common/ProductGraphic';

interface DesktopMarketplaceHubProps {
  onNavigate: (screenId: string) => void;
  onSelectProduct?: (product: any) => void;
}

export const DesktopMarketplaceHub: React.FC<DesktopMarketplaceHubProps> = ({ onNavigate, onSelectProduct }) => {
  const [activeCategory, setActiveCategory] = useState('Shoes & Kicks');
  const [searchTerm, setSearchTerm] = useState('');

  const handleProductClick = (product: any) => {
    if (onSelectProduct) onSelectProduct(product);
    onNavigate('12_desktop_product');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#FFFFFF',
        color: '#0F172A',
        fontFamily: 'var(--font-main, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onNavigate('01_home')}>
          <UniHiveLogo size={42} />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F2B5C', lineHeight: 1.1 }}>
              Uni<span style={{ color: '#F59E0B' }}>Hive</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
              The Connected Campus Network
            </div>
          </div>
        </div>

        {/* Campus Selector */}
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '9999px',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1D4ED8',
            cursor: 'pointer',
          }}
        >
          <span>Redeemer's Univ (Ede)</span>
          <span style={{ background: '#059669', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
            Active
          </span>
          <ChevronDown size={14} />
        </div>

        {/* Search Bar */}
        <div
          style={{
            flex: 1,
            maxWidth: '440px',
            display: 'flex',
            alignItems: 'center',
            background: '#F1F5F9',
            borderRadius: '12px',
            padding: '2px 4px 2px 14px',
            border: '1px solid #E2E8F0',
            gap: '8px',
          }}
        >
          <Search size={16} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search items in RUN hostels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 4px',
              fontSize: '13px',
              color: '#0F172A',
            }}
          />
          <button
            onClick={() => onNavigate('02_search')}
            style={{
              background: '#F59E0B',
              color: '#0F172A',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>

        {/* Nav Links & Profiles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onNavigate('06_vendor')}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>Merchant Studio</span>
          </button>

          <button
            onClick={() => onNavigate('07_dispatch')}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>Courier Portal</span>
          </button>

          {/* Cart with 1 badge */}
          <div
            onClick={() => onNavigate('04_checkout')}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <ShoppingBag size={20} color="#0F2B5C" />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#F59E0B',
                color: '#0F172A',
                fontSize: '10px',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </div>
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              AO
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                Amaka Okafor
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Queen Esther Hall • Rm 204
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div
        style={{
          borderBottom: '1px solid #E2E8F0',
          padding: '10px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFAFA',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginRight: '4px' }}>
            CATEGORIES:
          </span>

          {[
            { id: 'Shoes & Kicks' },
            { id: 'Thrift & Fits' },
            { id: 'Buttery & Food' },
            { id: 'Tech & Gadgets' },
            { id: 'Hair & Grooming' },
            { id: 'Academics & Stationery' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: '#FFFFFF',
                  border: isActive ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#0F172A' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{cat.id}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
          <span>34 Student Couriers Running Now</span>
        </div>
      </div>

      {/* Main Container: Sidebar + Product Grid */}
      <div style={{ flex: 1, display: 'flex', padding: '24px 40px', gap: '30px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Sticky Left Sidebar */}
        <aside style={{ width: '270px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 100% Anti-Scam Shield Card */}
          <div
            style={{
              background: '#0F2B5C',
              borderRadius: '20px',
              padding: '18px',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
              <ShieldCheck size={16} color="#FBBF24" />
              <span>100% Anti-Scam Shield</span>
            </div>
            <div style={{ fontSize: '12px', color: '#BFDBFE', lineHeight: 1.45 }}>
              Paystack locks your payment safely in escrow. You physically inspect your package at your hostel porter's lodge before giving the 4-digit code.
            </div>
          </div>

          {/* HOSTEL PROXIMITY */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.4px' }}>
                HOSTEL PROXIMITY
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}>
                RESET
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Queen Esther Hall (Female)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Joshua Hall (Male)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Deborah Hall (Female)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Guest House (Female)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Dorcas Hall (Female)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Prophet Moses Hall (Male)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Peter Hostel (Male)</span>
              </label>
            </div>
          </div>

          {/* CONDITION */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.4px', marginBottom: '14px' }}>
              CONDITION
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Brand New (In Box)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Refurbished (Like New)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Clean Thrift (Grade A)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span>Freshly Cooked Buttery</span>
              </label>
            </div>
          </div>

          {/* PRICE RANGE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.4px', marginBottom: '12px' }}>
              PRICE RANGE (₦)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}>
                ₦2,000
              </div>
              <span style={{ color: '#94A3B8' }}>–</span>
              <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}>
                ₦30,000
              </div>
            </div>
          </div>

          {/* Hostel Express Delivery Callout */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '18px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
              <span>Hostel Express Delivery</span>
            </div>
            <div style={{ fontSize: '11px', color: '#15803D', lineHeight: 1.45 }}>
              Flat ₦250 hostel fee. Delivered directly to your Ground Floor Porter's Lodge in 15 to 25 mins.
            </div>
          </div>
        </aside>

        {/* Right Main Grid */}
        <main style={{ flex: 1 }}>
          {/* Header & Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  Trending in Redeemer's University
                </span>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 10px',
                    borderRadius: '9999px',
                  }}
                >
                  14 Listings
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Verified student vendor inventory with instant porter lodge delivery
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
              <span>Sort by:</span>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <span>Hostel Proximity (Closest First)</span>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* 4-Column Product Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {/* Card 1: Nike Air Force 1 */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p1',
                  name: "Nike Air Force 1 '07 Low (Triple White)",
                  price: 18500,
                  vendor: 'Tunde Kicks',
                  hall: 'Joshua Hall',
                  condition: 'Refurbished Like New',
                  type: 'sneaker',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '16px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '140px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', color: '#1D4ED8' }}>
                  Size 43
                </div>
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ECFDF5', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', color: '#059669' }}>
                  RUN In-Campus
                </div>
                <ProductGraphic type="sneaker" size={100} />
              </div>

              <div style={{ fontSize: '10px', fontWeight: 800, color: '#D97706', letterSpacing: '0.4px', marginBottom: '2px' }}>
                REFURBISHED LIKE NEW
              </div>

              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Nike Air Force 1 '07 Low
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                Vendor: <strong style={{ color: '#0F172A' }}>Tunde Kicks</strong> • Joshua Hall
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 700, marginBottom: '14px' }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span>4.9 (142 orders)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>₦18,500</span>
                <button
                  style={{
                    background: '#F59E0B',
                    color: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Buy Now →
                </button>
              </div>
            </div>

            {/* Card 2: Oraimo Charger */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p2',
                  name: 'Oraimo 65W GaN Fast Charger',
                  price: 9000,
                  vendor: 'GadgetPlug',
                  hall: 'Joseph Hall',
                  condition: 'Brand New',
                  type: 'charger',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '16px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '140px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#059669', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', color: '#FFFFFF' }}>
                  Brand New
                </div>
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ECFDF5', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', color: '#059669' }}>
                  RUN In-Campus
                </div>
                <ProductGraphic type="charger" size={90} />
              </div>

              <div style={{ fontSize: '10px', fontWeight: 800, color: '#059669', letterSpacing: '0.4px', marginBottom: '2px' }}>
                FAST CHARGING
              </div>

              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Oraimo 65W GaN Fast Charger
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                Vendor: <strong style={{ color: '#0F172A' }}>GadgetPlug</strong> • Joseph Hall
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 700, marginBottom: '14px' }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span>5.0 (89 orders)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>₦9,000</span>
                <button
                  style={{
                    background: '#F59E0B',
                    color: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Buy Now →
                </button>
              </div>
            </div>

            {/* Card 3: Food / Jollof Rice */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p3',
                  name: 'Jollof Rice & Peppered Turkey',
                  price: 3500,
                  vendor: 'Central Buttery',
                  hall: 'RUN Core',
                  condition: 'Freshly Cooked',
                  type: 'food',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '16px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '140px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#F59E0B', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', color: '#FFFFFF' }}>
                  Freshly Cooked
                </div>
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ECFDF5', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', color: '#059669' }}>
                  RUN In-Campus
                </div>
                <ProductGraphic type="food" size={85} />
              </div>

              <div style={{ fontSize: '10px', fontWeight: 800, color: '#EA580C', letterSpacing: '0.4px', marginBottom: '2px' }}>
                HOT BUTTERY MEAL
              </div>

              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Jollof Rice & Peppered Turkey
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                Vendor: <strong style={{ color: '#0F172A' }}>Central Buttery</strong> • RUN Core
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 700, marginBottom: '14px' }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span>4.8 (310 orders)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>₦3,500</span>
                <button
                  style={{
                    background: '#EA580C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Order Food →
                </button>
              </div>
            </div>

            {/* Card 4: Vintage Corduroy Jacket */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p4',
                  name: 'Vintage Corduroy Jacket',
                  price: 7500,
                  vendor: 'ThriftZone',
                  hall: 'Queen Esther Hall',
                  condition: 'Grade A Clean',
                  type: 'jacket',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '16px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '140px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#818CF8', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', color: '#FFFFFF' }}>
                  Grade A Clean
                </div>
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ECFDF5', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', color: '#059669' }}>
                  RUN In-Campus
                </div>
                <ProductGraphic type="jacket" size={85} />
              </div>

              <div style={{ fontSize: '10px', fontWeight: 800, color: '#7C3AED', letterSpacing: '0.4px', marginBottom: '2px' }}>
                UNISEX VINTAGE
              </div>

              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Vintage Corduroy Jacket
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                Vendor: <strong style={{ color: '#0F172A' }}>ThriftZone</strong> • Queen Esther Hall
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 700, marginBottom: '14px' }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span>4.9 (72 orders)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>₦7,500</span>
                <button
                  style={{
                    background: '#F59E0B',
                    color: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Buy Now →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Desktop Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748B',
          background: '#FAFAFA',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UniHiveLogo size={22} />
          <span style={{ fontWeight: 800, color: '#0F2B5C' }}>UniHive™</span>
          <span>• The Connected Multi-Campus Marketplace</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Zero-Room-Entry Porter Safety Compliant</span>
          <span>•</span>
          <span>Escrow Powered by Paystack Subaccounts</span>
          <span>•</span>
          <span>Flagship: Redeemer's University (Ede)</span>
        </div>
      </footer>
    </div>
  );
};
