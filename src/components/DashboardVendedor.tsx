/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  TrendingDown,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Tag,
  CircleCheck,
  User,
  ShoppingBag,
  Clock,
  Sparkles,
  Calculator,
  ShieldAlert,
  RotateCcw,
  PackageOpen,
  Check,
  LogOut,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Package
} from 'lucide-react';
import { Product, Category, Sale, SaleItem, Store, Seller, CashAudit } from '../types';

interface DashboardVendedorProps {
  products: Product[];
  categories: Category[];
  stores: Store[];
  sellers: Seller[];
  sales: Sale[];
  audits: CashAudit[];
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onUpdateAudits: (audits: CashAudit[]) => void;
  onResetToHome: () => void;
  onInstallApp?: () => void;
  showInstallButton?: boolean;
}

export default function DashboardVendedor({
  products,
  categories,
  stores,
  sellers,
  sales,
  audits,
  onAddSale,
  onUpdateAudits,
  onResetToHome,
  onInstallApp,
  showInstallButton
}: DashboardVendedorProps) {
  // Navigation tabs matching the 4 seller modules
  const [activeTab, setActiveTab] = useState<'pos' | 'arqueo' | 'inventario' | 'historial'>('pos');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Currently authenticated cashier
  const [activeSellerId, setActiveSellerId] = useState<string>(sellers[0]?.id || 'sell-1');
  
  // Real-time dynamic clock matching the Lucy widget vibe
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  // Resolve active cashier profile and store details dynamically
  const activeSeller = useMemo(() => {
    return sellers.find(s => s.id === activeSellerId) || sellers[0];
  }, [sellers, activeSellerId]);

  const activeStore = useMemo(() => {
    if (!activeSeller) return stores[0];
    return stores.find(st => st.id === activeSeller.assignedStoreId) || stores[0];
  }, [stores, activeSeller]);

  // Active turn (audit) tracking: Find open turn for this cashier at this store
  const activeOpenAudit = useMemo(() => {
    if (!activeSeller || !activeStore) return null;
    return audits.find(aud => aud.cashier === activeSeller.name && aud.storeId === activeStore.id && !aud.isClosed);
  }, [audits, activeSeller, activeStore]);

  // Active Cart State
  const [cart, setCart] = useState<SaleItem[]>([]);
  
  // Custom Discount percentage
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Turn Opening inputs
  const [openingCashInput, setOpeningCashInput] = useState<string>('200');

  // Turn Closing physically counted inputs
  const [physicalCashDeclared, setPhysicalCashDeclared] = useState<string>('');
  const [physicalCardsDeclared, setPhysicalCardsDeclared] = useState<string>('');
  const [physicalTransfersDeclared, setPhysicalTransfersDeclared] = useState<string>('');
  const [closingMessage, setClosingMessage] = useState<string>('');

  // Checkout modal flow
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [saleSuccess, setSaleSuccess] = useState<Sale | null>(null);

  // Filtered Products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // Compute stats of sales made by active cashier during this current open shift
  const currentShiftSales = useMemo(() => {
    if (!activeSeller || !activeStore || !activeOpenAudit) return [];
    
    // Filter sales done at the active store, by active cashier, and newer than the current audit's opening timestamp
    return sales.filter(sale => 
      sale.storeId === activeStore.id && 
      sale.cashier === activeSeller.name &&
      new Date(sale.timestamp) >= new Date(activeOpenAudit.timestamp)
    );
  }, [sales, activeSeller, activeStore, activeOpenAudit]);

  // Sum of payments during current active turn
  const shiftCashSalesSum = useMemo(() => {
    return currentShiftSales
      .filter(s => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.total, 0);
  }, [currentShiftSales]);

  const shiftCardSalesSum = useMemo(() => {
    return currentShiftSales
      .filter(s => s.paymentMethod === 'card')
      .reduce((sum, s) => sum + s.total, 0);
  }, [currentShiftSales]);

  const shiftTransferSalesSum = useMemo(() => {
    return currentShiftSales
      .filter(s => s.paymentMethod === 'transfer')
      .reduce((sum, s) => sum + s.total, 0);
  }, [currentShiftSales]);

  const shiftSalesTotal = useMemo(() => {
    return currentShiftSales.reduce((sum, s) => sum + s.total, 0);
  }, [currentShiftSales]);

  // Expected cash dynamically: Starting fund + cash sales in this shift
  const expectedCashInDrawer = useMemo(() => {
    if (!activeOpenAudit) return 0;
    return (activeOpenAudit.expectedCash || 0) + shiftCashSalesSum;
  }, [activeOpenAudit, shiftCashSalesSum]);

  // Handle Cart Operations
  const addToCart = (product: Product) => {
    if (!activeOpenAudit) {
      alert('Debes abrir el turno primero con tu fondo de caja.');
      setActiveTab('arqueo');
      return;
    }

    const localPrice = activeStore?.prices[product.id] !== undefined ? activeStore.prices[product.id] : product.price;
    const localStock = activeStore?.stock[product.id] !== undefined ? activeStore.stock[product.id] : 0;
    
    const adaptedProduct = {
      ...product,
      price: localPrice,
      stock: localStock
    };

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= localStock) {
          return prev; // hit local store stock limit!
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (localStock <= 0) return prev;
        return [...prev, { product: adaptedProduct, quantity: 1 }];
      }
    });
  };

  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (!existing) return prev;
      
      if (existing.quantity === 1) {
        return prev.filter(item => item.product.id !== productId);
      }
      return prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getItemQtyInCart = (productId: string): number => {
    const found = cart.find(item => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  // Cart pricing totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const total = useMemo(() => {
    return Math.max(subtotal - discountAmount, 0);
  }, [subtotal, discountAmount]);

  const parsedCashReceived = parseFloat(cashReceived) || 0;
  const cashChange = useMemo(() => {
    if (parsedCashReceived < total) return 0;
    return parsedCashReceived - total;
  }, [parsedCashReceived, total]);

  const CASH_SHORTCUTS = [
    { value: total, label: 'Exacto' },
    { value: Math.ceil(total / 10) * 10, label: `$${Math.ceil(total / 10) * 10}` },
    { value: Math.ceil((total + 20) / 50) * 50, label: `$${Math.ceil((total + 20) / 50) * 50}` },
    { value: Math.ceil((total + 50) / 100) * 100, label: `$${Math.ceil((total + 50) / 100) * 100}` },
    { value: 200, label: '$200' },
    { value: 500, label: '$500' }
  ];

  // OP: Opening shift
  const handleOpenTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeller || !activeStore) return;

    const openingAmount = parseFloat(openingCashInput) || 0;
    
    const newAuditRec: CashAudit = {
      id: `aud-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      storeId: activeStore.id,
      cashier: activeSeller.name,
      expectedCash: openingAmount, // Starting fund
      reportedCash: 0,
      difference: 0,
      reportedCards: 0,
      reportedTransfers: 0,
      isClosed: false
    };

    onUpdateAudits([newAuditRec, ...audits]);
    setCart([]);
    setDiscountPercent(0);
    setActiveTab('pos');
  };

  // OP: Closing shift
  const handleCloseTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOpenAudit) return;

    const physicalCash = parseFloat(physicalCashDeclared) || 0;
    const physicalCards = parseFloat(physicalCardsDeclared) || 0;
    const physicalTransfers = parseFloat(physicalTransfersDeclared) || 0;

    // Difference = Physically counted cash - expected cash in drawer (Opening Fund + cash sales)
    const diff = physicalCash - expectedCashInDrawer;

    const updatedAudits = audits.map(aud => {
      if (aud.id === activeOpenAudit.id) {
        return {
          ...aud,
          reportedCash: physicalCash,
          reportedCards: physicalCards,
          reportedTransfers: physicalTransfers,
          difference: diff,
          isClosed: true
        };
      }
      return aud;
    });

    onUpdateAudits(updatedAudits);
    setPhysicalCashDeclared('');
    setPhysicalCardsDeclared('');
    setPhysicalTransfersDeclared('');
    setClosingMessage(`¡Turno cerrado con éxito! Diferencia de efectivo calculada en: $${diff.toFixed(2)}.`);
    setCart([]);
    setDiscountPercent(0);
  };

  // OP: Finalize Sale
  const handleFinalizeSale = () => {
    if (cart.length === 0) return;
    if (!activeOpenAudit) {
      alert('Debes abrir el turno primero para poder vender.');
      return;
    }
    if (paymentMethod === 'cash' && parsedCashReceived < total) {
      alert('El dinero recibido es menor que el total de la venta.');
      return;
    }

    const saleRecord: Omit<Sale, 'id'> = {
      timestamp: new Date().toISOString(),
      storeId: activeStore.id,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parsedCashReceived : undefined,
      changePaid: paymentMethod === 'cash' ? cashChange : undefined,
      cashier: activeSeller.name,
    };

    // Callback that reports sale upward (updates inventory & logs dynamic array)
    onAddSale(saleRecord);

    const temporaryReceipt: Sale = {
      ...saleRecord,
      id: `V-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setSaleSuccess(temporaryReceipt);
  };

  // Release and clear POS ticket
  const handleCloseReceiptModal = () => {
    setCart([]);
    setDiscountPercent(0);
    setCashReceived('');
    setSaleSuccess(null);
    setShowCheckoutModal(false);
  };

  return (
    <div id="vendedor-workspace-root" className="min-h-screen bg-slate-50 text-slate-950 flex flex-col md:flex-row font-sans">
      
      {/* DESKTOP SIDEBAR - Cybernetic premium purple aesthetic from reference image */}
      <aside className="w-68 bg-gradient-to-b from-indigo-700 via-indigo-900 to-slate-950 text-white hidden md:flex flex-col justify-between p-5 shrink-0 z-40 sticky top-0 h-screen shadow-2xl">
        <div className="space-y-6">
          {/* Logo Brand Header Block */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-indigo-500/20">
            <img 
              src="https://cossma.com.mx/bp.jpeg" 
              alt="Logo Tienditas BP" 
              className="h-12 w-auto object-contain rounded-xl shadow-md border border-white/10" 
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-sm font-black tracking-widest text-indigo-200 uppercase font-display block">TIENDITAS BP</span>
              <span className="text-[10px] font-mono text-cyan-400 block tracking-tight uppercase">Terminal Móvil</span>
            </div>
          </div>

          {/* Cashier profile avatar display inspired by the Hello-Lucy widget design */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-405 flex items-center justify-center text-white border-2 border-white/20 text-base font-bold select-none">
                {activeSeller?.name.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-indigo-200 uppercase font-mono tracking-wider block">Cajero de Servicio</span>
                <span className="text-sm font-bold truncate block text-white">{activeSeller?.name}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono leading-tight space-y-1 block text-indigo-100/80">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 inline-block animate-pulse"></span>
                <span>{activeStore?.name}</span>
              </div>
              <div className="truncate">🎪 En: {activeSeller?.assignedEvent || 'Evento de Temporada'}</div>
              <div className="text-[10px] mt-1 p-1 bg-white/5 rounded text-cyan-400 font-bold border border-white/5 flex items-center justify-between">
                <span>ESTADO:</span>
                <span>{activeOpenAudit ? '🟢 TURNO ABIERTO' : '🔴 SIN ABRIR'}</span>
              </div>
            </div>
          </div>

          {/* Core Sidebar Nav Menu with Large touch points */}
          <nav className="space-y-1">
            {[
              { id: 'pos', label: '🖥️ Punto de Venta', desc: 'Atender y facturar', isBadge: activeOpenAudit !== null },
              { id: 'arqueo', label: '🔑 Arqueo / Turno', desc: 'Aperturas y cierres', isBadge: false },
              { id: 'inventario', label: '📦 Stock Local', desc: 'Saldos de tienda', isBadge: false },
              { id: 'historial', label: '📋 Mis Ventas', desc: 'Control diario de caja', isBadge: false }
            ].map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-3 px-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col group relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-102 font-bold'
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm leading-none">{tab.label}</span>
                    {tab.isBadge && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 absolute right-3 top-3"></span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 font-normal block ${isSelected ? 'text-cyan-100' : 'text-indigo-300'}`}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions of Sidebar */}
        <div className="space-y-4 pt-4 border-t border-indigo-500/10">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> HORA LOCAL</span>
            <span>{currentTime || '06:30 AM'}</span>
          </div>

          {showInstallButton && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5 group transition-all transform hover:scale-[1.02]"
            >
              <span>📱 Instalar App Oficial</span>
            </button>
          )}

          <button
            onClick={onResetToHome}
            className="w-full border border-indigo-500/30 hover:bg-white/5 text-indigo-200 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Abandonar Rol</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen pb-24 md:pb-6 overflow-x-hidden">
        
        {/* MOBILE TOP NAVIGATION HEADER BAR */}
        <header className="bg-white border-b border-slate-200 py-3 px-4 flex items-center justify-between md:hidden sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <img 
              src="https://cossma.com.mx/bp.jpeg" 
              alt="Logo Tienditas BP" 
              className="h-8 w-auto object-contain rounded-md" 
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-black tracking-widest text-[#4f46e5] block leading-none font-display text-slate-900">TIENDITAS BP</span>
              <span className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-tight block mt-0.5">{activeStore?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 py-1 px-2 rounded-lg border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={activeSellerId}
                onChange={(e) => {
                  setActiveSellerId(e.target.value);
                  setCart([]);
                }}
                className="bg-transparent border-none text-slate-800 font-bold text-[10px] focus:outline-none cursor-pointer max-w-[70px] truncate"
              >
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onResetToHome}
              className="border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[10px] py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer block leading-none"
            >
              Salir
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY INNER */}
        <div id="vendedor-workspace-body" className="p-4 md:p-6 lg:p-8 space-y-6 flex-grow">
          
          {/* HELLO USER GREETING BANNER - Inspired by Lucy widget in the reference image */}
          <section className="bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 select-none">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-400/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

            <div className="space-y-2 text-center md:text-left z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-xs uppercase tracking-widest font-mono font-extrabold bg-white/20 border border-white/25 px-3 py-1 rounded-full text-cyan-100">
                  🎪 Evento Activo: {activeSeller?.assignedEvent || 'Evento General'}
                </span>
                <span className="text-xs uppercase tracking-widest font-mono font-bold bg-white/10 px-2 py-1 rounded-full text-white/90">
                  👤 Cajero: {activeSeller?.name}
                </span>
              </div>
              <h2 className="text-2xl md:text-3.5xl font-black font-display tracking-tight leading-tight">
                ¡Hola, {activeSeller?.name.split(' ')[0]}! Buen Día ☀️
              </h2>
              <p className="text-sky-50 font-medium text-xs md:text-base max-w-lg leading-snug">
                Estas operando en la sucursal <strong className="text-white underline">{activeStore?.name}</strong>. Aplican precios específicos de evento.
              </p>
            </div>

            {/* Quick metrics boxes within hello widget */}
            <div className="flex gap-4 shrink-0 z-10 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 py-3.5 px-5 rounded-2xl text-center min-w-[110px]">
                <span className="text-[10px] font-bold font-mono tracking-widest text-cyan-200 block uppercase mb-1">VENTAS SHIFT</span>
                <span className="text-lg md:text-2xl font-black">${shiftSalesTotal.toFixed(2)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 py-3.5 px-5 rounded-2xl text-center min-w-[110px]">
                <span className="text-[10px] font-bold font-mono tracking-widest text-cyan-200 block uppercase mb-1">TRANSACCIONES</span>
                <span className="text-lg md:text-2xl font-black">{currentShiftSales.length}</span>
              </div>
            </div>
          </section>

          {/* DYNAMIC TAB SWITCH VIEWPORT CORES */}
          <div className="transition-all duration-300">
            
            {/* ============================================================ */}
            {/* VIEW 1: PUNTO DE VENTA (POS / CAJA) */}
            {/* ============================================================ */}
            {activeTab === 'pos' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Check if turn is opened or display Apertura Form immediately */}
                {!activeOpenAudit ? (
                  <div className="col-span-full bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center max-w-xl mx-auto space-y-6">
                    <div className="bg-amber-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-800">Caja Cerrada / Turno sin Abrir</h3>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        Para operar el Punto de Venta en este evento, debes registrar tu fondo de caja inicial para dar cambio.
                      </p>
                    </div>

                    <form onSubmit={handleOpenTurn} className="space-y-4 max-w-xs mx-auto">
                      <div>
                        <label className="text-xs font-bold font-mono text-slate-400 uppercase block mb-1 text-left">Fondo Inicial de Caja ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-450 text-lg">$</span>
                          <input
                            type="text"
                            required
                            value={openingCashInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                setOpeningCashInput(val);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 font-black text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ej. 200.00"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all"
                      >
                        Abrir Turno de Venta 🚀
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    {/* LEFT COLUMN: Catalog panel (8 cols) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
                      
                      {/* Catalog Filter Controls bar */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                        {/* Search Input Filter */}
                        <div className="relative flex-1">
                          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar bebida, alimento, kirkland, etc..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          {search && (
                            <button 
                              onClick={() => setSearch('')}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Quick filter scroll category triggers */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                          <button
                            onClick={() => setSelectedCategory('todos')}
                            className={`px-3 focus:outline-hidden py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 ${
                              selectedCategory === 'todos' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-slate-600 bg-slate-100 hover:bg-slate-250/60'
                            }`}
                          >
                            Todos
                          </button>
                          {categories.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCategory(c.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 ${
                                selectedCategory === c.id 
                                  ? 'bg-indigo-650 text-white shadow-md' 
                                  : 'text-slate-500 bg-slate-100 hover:bg-slate-250/60'
                              }`}
                            >
                              {c.id === 'alimentos' ? '🍖 ' : c.id === 'importados' ? '💎 ' : '⚡ '}
                              {c.name.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Product catalog grid with extreme legibility and high design */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.length === 0 ? (
                          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-250/50 text-slate-400 text-sm font-mono flex flex-col items-center justify-center space-y-2">
                            <PackageOpen className="w-10 h-10 text-slate-300" />
                            <span>No se encontraron productos registrados.</span>
                          </div>
                        ) : (
                          filteredProducts.map(product => {
                            // Find corresponding pricing override and core inventory numbers
                            const localPrice = activeStore?.prices[product.id] !== undefined ? activeStore.prices[product.id] : product.price;
                            const localStock = activeStore?.stock[product.id] !== undefined ? activeStore.stock[product.id] : 0;
                            const qtyInCart = getItemQtyInCart(product.id);
                            const isOutOfStock = localStock <= 0;
                            const isLimitHit = qtyInCart >= localStock;
                            const categoryObj = categories.find(c => c.id === product.category);

                            return (
                              <motion.div
                                key={product.id}
                                whileTap={!isOutOfStock && !isLimitHit ? { scale: 0.97 } : {}}
                                className={`bg-white rounded-3xl border-2 p-5 flex flex-col justify-between transition-all relative ${
                                  isOutOfStock 
                                    ? 'border-slate-100 opacity-50 bg-slate-50' 
                                    : qtyInCart > 0 
                                      ? 'border-indigo-600 ring-2 ring-indigo-500/10' 
                                      : 'border-slate-200/60 hover:border-indigo-400'
                                }`}
                              >
                                {/* Active selected badge indicator */}
                                {qtyInCart > 0 && (
                                  <span className="absolute -top-3.5 -right-2.5 bg-indigo-605 bg-indigo-600 text-white font-mono text-sm font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-indigo-100">
                                    {qtyInCart}
                                  </span>
                                )}

                                <div className="space-y-3.5">
                                  {/* Giant graphic badge icon */}
                                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100/40 flex items-center justify-center text-4.5xl select-none mb-4 shadow-sm">
                                    {product.emoji}
                                  </div>

                                  <div>
                                    {categoryObj && (
                                      <span className="text-[10px] font-bold font-mono tracking-widest text-[#4f46e5] uppercase block mb-1">
                                        ✨ {categoryObj.name}
                                      </span>
                                    )}
                                    {/* EXTREME LEGIBILITY text size upgrade */}
                                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight tracking-tight line-clamp-2">
                                      {product.name}
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-450 block uppercase tracking-wider mt-1 font-bold">
                                      SKU: {product.sku}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-4 flex items-end justify-between border-t border-slate-100 mt-5">
                                  {/* Price Display */}
                                  <div>
                                    <span className="text-[11px] font-bold font-mono text-indigo-455 text-indigo-600 uppercase block tracking-wider">
                                      Precio Evento
                                    </span>
                                    <span className="block font-black text-slate-950 text-base md:text-xl tracking-tight leading-none mt-0.5">
                                      ${localPrice.toFixed(2)}
                                    </span>
                                    <span className={`text-[10px] mt-1 font-bold block ${isOutOfStock ? 'text-red-500 underline font-extrabold' : isLimitHit ? 'text-amber-500' : 'text-slate-400'}`}>
                                      {isOutOfStock ? '🔴 AGOTADO EVENTO' : `${localStock - qtyInCart} unidades.`}
                                    </span>
                                  </div>

                                  {/* Oversized Operation Add Action */}
                                  <button
                                    onClick={() => addToCart(product)}
                                    disabled={isOutOfStock || isLimitHit}
                                    className={`p-3 rounded-2xl transition-all h-11 w-11 flex items-center justify-center cursor-pointer ${
                                      isOutOfStock 
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                        : isLimitHit
                                          ? 'bg-amber-100 text-amber-500 cursor-not-allowed' 
                                          : 'bg-indigo-600 text-white shadow-md hover:bg-slate-950 active:scale-95'
                                    }`}
                                    title="Añadir un artículo"
                                  >
                                    <Plus className="w-5 h-5" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Active Cart container panel representing professional shopping panel (4/12 cols) */}
                    <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3.5xl rounded-3xl border border-slate-205 border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)] sticky top-24">
                      
                      {/* Active count ribbon */}
                      <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-[#4f46e5]" />
                          <h3 className="text-sm md:text-base font-extrabold text-slate-900 font-display">Resumen Compra</h3>
                        </div>
                        <span className="font-mono bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-black">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} uds.
                        </span>
                      </div>

                      {/* Items row iterator */}
                      <div className="flex-1 overflow-y-auto p-4 md:p-5 divide-y divide-slate-100 space-y-4">
                        {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono space-y-4 select-none">
                            <ShoppingBag className="w-14 h-14 text-indigo-100 stroke-[1.5]" />
                            <div className="text-xs font-bold text-slate-500">Carrito de ventas vacío</div>
                            <div className="text-[11px] text-slate-400 max-w-xs leading-snug">Presiona sobre los productos del catálogo izquierdo para registrar cargos de venta.</div>
                          </div>
                        ) : (
                          cart.map(item => (
                            <div key={item.product.id} className="pt-4 flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{item.product.emoji}</span>
                                  <span className="font-bold text-slate-850 text-xs md:text-sm leading-snug text-slate-900 line-clamp-2">{item.product.name}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-mono font-bold mt-1.5 flex items-center gap-2">
                                  <span>${item.product.price.toFixed(2)} c/u</span>
                                  <span className="h-1.5 w-1.5 bg-slate-200 rounded-full"></span>
                                  <span className="text-[#4f46e5]">Subotal: ${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Quantity Control bar */}
                              <div className="flex items-center space-x-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => decreaseQuantity(item.product.id)}
                                  className="p-1.5 hover:bg-slate-200 text-slate-650 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-bold font-mono text-sm text-slate-950 px-2 text-center min-w-[18px]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(item.product)}
                                  disabled={item.quantity >= item.product.stock}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    item.quantity >= item.product.stock 
                                      ? 'text-slate-300 cursor-not-allowed' 
                                      : 'hover:bg-slate-200 text-slate-650 cursor-pointer'
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Delete button */}
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-xl transition-colors cursor-pointer shrink-0"
                                title="Quitar pieza"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Cart calculations footer actions representation */}
                      <div className="p-5 bg-slate-50 border-t border-slate-200/80 space-y-4">
                        
                        {/* Interactive discount tagging */}
                        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                          <span className="text-xs text-slate-500 font-bold font-mono flex items-center gap-1 shrink-0">
                            <Tag className="w-4 h-4 text-indigo-554 text-[#4f46e5]" />
                            ¿Ofrecer Descuento?
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                            {[0, 5, 10, 15].map(pct => (
                              <button
                                key={pct}
                                onClick={() => setDiscountPercent(pct)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                                  discountPercent === pct 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {pct === 0 ? '0%' : `${pct}%`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Highly Legible Display Calculation Board */}
                        <div className="space-y-2 text-sm text-slate-650 font-mono font-bold">
                          <div className="flex justify-between text-slate-500 text-xs">
                            <span>Monto Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                          {discountPercent > 0 && (
                            <div className="flex justify-between text-red-500 text-xs">
                              <span>Rebaja Aplicada ({discountPercent}%)</span>
                              <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-3">
                            <span className="text-base text-slate-950 font-extrabold font-display">TOTAL A COBRAR</span>
                            <span id="pos-total-display" className="text-xl md:text-3xl text-indigo-600 font-extrabold tracking-tight">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Complete responsive trigger */}
                        <button
                          onClick={() => cart.length > 0 && setShowCheckoutModal(true)}
                          disabled={cart.length === 0}
                          className={`w-full py-4 rounded-2xl text-center text-xs md:text-sm font-bold tracking-tight transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                            cart.length > 0 
                              ? 'bg-[#4f46e5] text-white hover:bg-slate-950 hover:shadow-lg hover:scale-101' 
                              : 'bg-slate-200 text-slate-450 cursor-not-allowed border border-slate-300/40'
                          }`}
                        >
                          <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
                          Cobrar Venta Real-Time
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: APERTURA Y CIERRE DE TURNO (ARQUEO / CAJA) */}
            {/* ============================================================ */}
            {activeTab === 'arqueo' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                
                {/* Status Notice Block */}
                <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
                  activeOpenAudit 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-amber-50 border-amber-100 text-amber-800'
                }`}>
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                    activeOpenAudit ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {activeOpenAudit ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm md:text-base">
                      {activeOpenAudit ? '¡Turno de Venta Actualmente Abierto!' : 'Turno Cerrado / Esperando Apertura'}
                    </h4>
                    <p className="text-xs md:text-sm font-medium mt-0.5 opacity-90">
                      {activeOpenAudit 
                        ? `Abierto por ${activeSeller.name} el ${new Date(activeOpenAudit.timestamp).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}.`
                        : 'Debes declarar un fondo inicial de caja de cambio para desbloquear el Punto de Venta.'
                      }
                    </p>
                  </div>
                </div>

                {closingMessage && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-800 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn">
                    <Award className="w-5 h-5 text-indigo-554" />
                    <span>{closingMessage}</span>
                  </div>
                )}

                {/* TWO FLAVOR CARD WORKFLOW BASED ON TURN STATUS */}
                {!activeOpenAudit ? (
                  /* SHIFT MODE: OPEN SHIFT PORTAL */
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Calculator className="w-5.5 h-5.5 text-indigo-600" />
                        Registro del Fondo de Caja (Apertura)
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Ingresa la cantidad física de dinero en efectivo con la que inicias el turno para dar vueltos.
                      </p>
                    </div>

                    <form onSubmit={handleOpenTurn} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest block">EFECTIVO INICIAL EN CAJA ($)</label>
                        <div className="relative max-w-xs">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-[#4f46e5] text-lg">$</span>
                          <input
                            type="text"
                            required
                            value={openingCashInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                setOpeningCashInput(val);
                              }
                            }}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 pl-9 pr-4 font-black text-xl md:text-2xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            placeholder="Ej. 150.00"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">Normalmente se inicia con un fondo de cambio establecido de $100.00 a $300.00 pesos en morrallas.</p>
                      </div>

                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-slate-950 text-white font-bold py-3.5 px-8 rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all"
                      >
                        Iniciar Operaciones de Caja 🔓
                      </button>
                    </form>
                  </div>
                ) : (
                  /* SHIFT MODE: ACTIVE RUNNING SHIFT / DECLARE CLOSE values */
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-8 shadow-sm">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <RotateCcw className="w-5.5 h-5.5 text-indigo-600" />
                        Cierre de Caja y Declaración de Valores
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Realiza el corte físico contando tus valores recaudados en efectivo, tarjetas y transferencias. El administrador recibirá el arqueo contrastado automáticamente.
                      </p>
                    </div>

                    {/* Left & Right layout: Dynamic metrics contrast summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2.5xl rounded-3xl border border-slate-200/80">
                      
                      {/* Left: expected formulas */}
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase font-bold text-indigo-650 text-indigo-600 font-mono tracking-wider">Cálculo del Sistema (Esperado)</h4>
                        
                        <div className="space-y-2 text-xs md:text-sm font-semibold text-slate-650">
                          <div className="flex justify-between">
                            <span>(+) Fondo Inicial de Apertura:</span>
                            <span className="font-mono font-bold text-slate-800">${(activeOpenAudit.expectedCash || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>(+) Ventas Efectivo Shift:</span>
                            <span className="font-mono font-bold text-emerald-600">+${shiftCashSalesSum.toFixed(2)}</span>
                          </div>
                          <div className="h-[1px] bg-slate-200 my-2"></div>
                          
                          <div className="flex justify-between font-extrabold text-slate-905 text-slate-900 text-sm md:text-base">
                            <span>(=) Efectivo Esperado en Caja:</span>
                            <span className="font-mono text-[#4f46e5] text-base md:text-lg">${expectedCashInDrawer.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-505 text-slate-500 font-bold">
                          <div className="flex justify-between">
                            <span>Esperado Tarjetas POS:</span>
                            <span className="font-mono text-slate-800">${shiftCardSalesSum.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Esperado Transferencias:</span>
                            <span className="font-mono text-slate-800">${shiftTransferSalesSum.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Informational reminder */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-2xl">💡</span>
                          <h5 className="text-xs font-bold text-slate-800">Fórmula de Arqueo</h5>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            Ingresa los montos totales que posees físicamente en mano. Si cuadra perfecto, tu diferencia calculada será de <strong>$0.00</strong>.
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-4">
                          *Cajero Responsable: {activeSeller.name}
                        </div>
                      </div>

                    </div>

                    {/* Closing submission form */}
                    <form onSubmit={handleCloseTurn} className="space-y-6">
                      <h4 className="text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">Declarar valores físicos contados</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Cash physically counted */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-emerald-500" />
                            Efectivo Físico ($)
                          </label>
                          <input
                            type="text"
                            required
                            value={physicalCashDeclared}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) setPhysicalCashDeclared(val);
                            }}
                            className="bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-xl py-2.5 px-3.5 font-bold font-mono tracking-tight text-slate-900 w-full"
                            placeholder="Ej. 350.00"
                          />
                          <span className="text-[10px] text-slate-400 font-medium block">Total billetes + monedas.</span>
                        </div>

                        {/* Card physical tickets/vouchers */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            Vouchers Tarjeta ($)
                          </label>
                          <input
                            type="text"
                            required
                            value={physicalCardsDeclared}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) setPhysicalCardsDeclared(val);
                            }}
                            className="bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-xl py-2.5 px-3.5 font-bold font-mono tracking-tight text-slate-900 w-full"
                            placeholder="Ej. 240.00"
                          />
                          <span className="text-[10px] text-slate-400 font-medium block">Suma de recibos bancarios.</span>
                        </div>

                        {/* Transfer amount physically validated */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-purple-550 text-indigo-505 text-indigo-600" />
                            Transferencia QR ($)
                          </label>
                          <input
                            type="text"
                            required
                            value={physicalTransfersDeclared}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) setPhysicalTransfersDeclared(val);
                            }}
                            className="bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-xl py-2.5 px-3.5 font-bold font-mono tracking-tight text-slate-900 w-full"
                            placeholder="Ej. 120.00"
                          />
                          <span className="text-[10px] text-slate-400 font-medium block">Capturas confirmadas de CoDi.</span>
                        </div>

                      </div>

                      {/* Immediate Live Difference preview */}
                      {physicalCashDeclared !== '' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-mono text-xs flex justify-between items-center">
                          <span className="font-bold text-slate-500">Diferencia preliminar en efectivo:</span>
                          <span className={`text-base font-extrabold ${
                            (parseFloat(physicalCashDeclared) || 0) === expectedCashInDrawer
                              ? 'text-emerald-700'
                              : (parseFloat(physicalCashDeclared) || 0) > expectedCashInDrawer
                                ? 'text-blue-600'
                                : 'text-red-650'
                          }`}>
                            ${((parseFloat(physicalCashDeclared) || 0) - expectedCashInDrawer).toFixed(2)}
                            {((parseFloat(physicalCashDeclared) || 0) === expectedCashInDrawer) && ' (¡Cuadrado Perfecto! 🎉)'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-slate-950 text-white font-extrabold py-3.5 px-8 rounded-2xl cursor-pointer shadow-md transition-all flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Finalizar y Registrar Arqueo definitivo</span>
                        </button>
                      </div>
                    </form>

                  </div>
                )}

              </motion.div>
            )}

            {/* ============================================================ */}
            {/* VIEW 3: INVENTARIO LOCAL (CONSULTA DE STOCK) */}
            {/* ============================================================ */}
            {activeTab === 'inventario' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                
                {/* Search products only in store */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-5.5 h-5.5 text-indigo-650" />
                        Catalogo de Inventario Local (Estoque actual)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Saldos correspondientes a los productos almacenados en la unidad móvil <strong className="text-slate-800">{activeStore?.name}</strong>.</p>
                    </div>

                    <div className="relative w-full md:w-64 max-w-xs">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar stock local..."
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 py-1.5 pl-9 pr-3 rounded-xl text-xs w-full font-bold"
                      />
                    </div>
                  </div>

                  {/* Stock listings table */}
                  <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150/80 font-bold font-mono text-slate-400 uppercase tracking-widest text-[10px]">
                          <th className="py-3 px-4">Articulo</th>
                          <th className="py-3 px-4">SKU / Clave</th>
                          <th className="py-3 px-4 text-right">Precio Evento</th>
                          <th className="py-3 px-4 text-center">Unidades Disponibles</th>
                          <th className="py-3 px-4 text-center">Estado Alerta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {products
                          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
                          .map(product => {
                            const localPrice = activeStore?.prices[product.id] !== undefined ? activeStore.prices[product.id] : product.price;
                            const localStock = activeStore?.stock[product.id] !== undefined ? activeStore.stock[product.id] : 0;
                            const isOutOfStock = localStock <= 0;
                            const isLowStock = localStock > 0 && localStock <= product.minStock;

                            return (
                              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 flex items-center gap-2">
                                  <span className="text-xl shrink-0">{product.emoji}</span>
                                  <span className="font-extrabold text-slate-900 text-xs md:text-sm">{product.name}</span>
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-[11px] text-slate-400 uppercase">{product.sku}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800 font-mono">${localPrice.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center font-mono font-black">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-bold leading-none ${
                                    isOutOfStock 
                                      ? 'bg-red-50 text-red-700 font-extrabold' 
                                      : isLowStock 
                                        ? 'bg-amber-50 text-amber-550 border border-amber-100' 
                                        : 'bg-emerald-50 text-emerald-800 font-bold'
                                  }`}>
                                    {localStock} uds.
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block h-2 w-2 rounded-full ${
                                    isOutOfStock 
                                      ? 'bg-red-500 animate-pulse' 
                                      : isLowStock 
                                        ? 'bg-amber-500' 
                                        : 'bg-emerald-500'
                                  }`}></span>
                                  <span className={`text-[10px] uppercase font-mono font-bold ml-1.5 ${
                                    isOutOfStock 
                                      ? 'text-red-550 text-red-500' 
                                      : isLowStock 
                                        ? 'text-amber-550 text-amber-500'
                                        : 'text-slate-400'
                                  }`}>
                                    {isOutOfStock ? 'Agotado' : isLowStock ? 'Bajo' : 'Optimo'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ============================================================ */}
            {/* VIEW 4: HISTORIAL DEL TURNO (MIS VENTAS DEL DÍA) */}
            {/* ============================================================ */}
            {activeTab === 'historial' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                
                {/* List sales made specifically by this active cashier, for safety (cannot inspect other shifts) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                    <div>
                      <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5.5 h-5.5 text-indigo-650 animate-pulse" />
                        Historial de Ventas - Mi Turno Actual
                      </h3>
                      <p className="text-[11px] text-slate-500">Solo se muestran los tickets liquidados por ti ({activeSeller?.name}) en la terminal del evento activo.</p>
                    </div>

                    <span className="font-mono bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded-full uppercase">
                      {currentShiftSales.length} total
                    </span>
                  </div>

                  {currentShiftSales.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl text-slate-400 font-mono text-xs flex flex-col items-center justify-center space-y-2">
                      <ShoppingBag className="w-10 h-10 text-slate-350" />
                      <span>Aún no registras ventas en tu turno actual.</span>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {currentShiftSales.map(sale => (
                        <div 
                          key={sale.id}
                          className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Invoice heading line status */}
                          <div className="space-y-1 shrink-0">
                            <span className="text-xs font-mono font-bold text-indigo-600 block uppercase">Comprobante #{sale.id}</span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-450 font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(sale.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                              sale.paymentMethod === 'cash' 
                                ? 'bg-emerald-100 text-emerald-850' 
                                : sale.paymentMethod === 'card' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                            }`}>
                              🟢 Pago: {sale.paymentMethod === 'cash' ? 'Efectivo' : sale.paymentMethod === 'card' ? 'Terminal POS/Tarjeta' : 'Qrcode / CoDi'}
                            </span>
                          </div>

                          {/* Items listed in nice rows */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold block mb-1 uppercase">Artículos Comprados</span>
                            <div className="text-xs text-slate-705 text-slate-700 leading-snug space-x-1.5 flex flex-wrap gap-1">
                              {sale.items.map((it, idx) => (
                                <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold inline-block shrink-0">
                                  {it.quantity}x {it.name.split(' ')[0]} 
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Subtotals display with giant legible typography */}
                          <div className="text-right shrink-0 bg-white p-3 border border-slate-200 rounded-xl min-w-[100px]">
                            <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Monto Total</span>
                            <span className="text-sm md:text-base font-black font-mono text-slate-950">${sale.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </motion.div>
            )}

          </div>

        </div>

      </main>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR - Inspired by high-end native PWAs and reference UI menu */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex justify-around items-center px-1 pb-safe shadow-lg">
        {[
          { id: 'pos', label: 'Caja POS', icon: ShoppingCart },
          { id: 'arqueo', label: 'Corte/Turno', icon: Calculator },
          { id: 'inventario', label: 'Stock', icon: Package },
          { id: 'historial', label: 'Mis Ventas', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                isSelected ? 'text-indigo-650 scale-102 font-extrabold' : 'text-slate-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-450'}`}>
                <Icon className="w-5.5 h-5.5 shrink-0" />
              </div>
              <span className="mt-0.5 leading-none block text-[10px]">{tab.label}</span>
            </button>
          )
        })}
      </footer>

      {/* CHECKOUT MODAL WINDOW WITH BARCODES & RECEIPT LOG EMBED FOR EXTREME DESIGN QUALITY */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!saleSuccess ? () => setShowCheckoutModal(false) : undefined}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body Card representing complete checkout module */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-lg z-10 relative overflow-hidden"
            >

              {!saleSuccess ? (
                /* CHECKOUT STATE A: Enter payment received elements */
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      Finalizar y Cobrar Transacción
                    </h3>
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono tracking-widest font-black text-slate-450 uppercase block">Cuentas y Métodos de Cobro</label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Cash */}
                      <button
                        onClick={() => { setPaymentMethod('cash'); setCashReceived(''); }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2.5xl rounded-2xl border-2 transition-all cursor-pointer ${
                          paymentMethod === 'cash' 
                            ? 'border-indigo-650 bg-indigo-50 text-[#4f46e5] font-extrabold shadow-sm' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                      >
                        <Banknote className="w-6 h-6 mb-2 text-[#4f46e5]" />
                        <span className="text-xs font-extrabold">Efectivo</span>
                      </button>

                      {/* Card */}
                      <button
                        onClick={() => { setPaymentMethod('card'); setCashReceived('-1'); }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2.5xl rounded-2xl border-2 transition-all cursor-pointer ${
                          paymentMethod === 'card' 
                            ? 'border-indigo-650 bg-indigo-50 text-[#4f46e5] font-extrabold shadow-sm' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 mb-2 text-[#4f46e5]" />
                        <span className="text-xs font-extrabold">Tarjeta Terminal</span>
                      </button>

                      {/* Electronic Direct Transfer */}
                      <button
                        onClick={() => { setPaymentMethod('transfer'); setCashReceived('-1'); }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2.5xl rounded-2xl border-2 transition-all cursor-pointer ${
                          paymentMethod === 'transfer' 
                            ? 'border-indigo-650 bg-indigo-50 text-[#4f46e5] font-extrabold shadow-sm' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                      >
                        <Smartphone className="w-6 h-6 mb-2 text-[#4f46e5]" />
                        <span className="text-xs font-extrabold">Transferencia QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Operational Cash flow calculator pad */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-500">Monto Neto a Pagar:</span>
                        <span className="font-mono text-slate-900 font-extrabold text-lg">${total.toFixed(2)}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Efectivo Recibido por el Cliente ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-base">$</span>
                          <input
                            type="text"
                            required
                            value={cashReceived}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) setCashReceived(val);
                            }}
                            placeholder="Ej. 100.00"
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-8 pr-4 font-black font-mono text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                      </div>

                      {/* Cash keyboard quick shortcuts */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {CASH_SHORTCUTS.map((sc, childIdx) => {
                          if (sc.value < total && sc.label !== 'Exacto') return null;
                          return (
                            <button
                              key={childIdx}
                              type="button"
                              onClick={() => setCashReceived(sc.value.toFixed(2))}
                              className="bg-white hover:bg-slate-100 font-mono font-bold text-slate-650 border border-slate-200 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                            >
                              {sc.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Auto Cash difference change calculation */}
                      {parsedCashReceived >= total ? (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-mono text-emerald-800 font-bold">
                          <span>CAMBIO / VUELTO A ENTREGAR:</span>
                          <span className="text-xl font-black">${cashChange.toFixed(2)}</span>
                        </div>
                      ) : (
                        parsedCashReceived > 0 && (
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-red-500 font-mono font-bold">
                            <span>RESTA POR COBRAR:</span>
                            <span>${(total - parsedCashReceived).toFixed(2)}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {paymentMethod !== 'cash' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-mono space-y-2">
                      <div className="flex justify-between">
                        <span>Terminal Móvil de Cobro:</span>
                        <span className="font-bold uppercase text-slate-800">TIENDITABP-POS-ACTIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Canal de Pago:</span>
                        <span className="font-bold uppercase text-slate-800">{paymentMethod === 'card' ? 'Voucher POS Bancario de Eventos' : 'CoDi / Transferencia QR'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-indigo-600 text-sm">
                        <span>Total Neto Auditado:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
                    >
                      Seguir Vendiendo
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalizeSale}
                      disabled={paymentMethod === 'cash' && parsedCashReceived < total}
                      className={`px-6 py-3 rounded-xl text-xs font-extrabold shadow-md cursor-pointer ${
                        paymentMethod === 'cash' && parsedCashReceived < total
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-slate-950 text-white shadow-lg'
                      }`}
                    >
                      Confirmar Venta y Generar Ticket
                    </button>
                  </div>
                </div>
              ) : (
                /* CHECKOUT STATE B: Digital Receipt layout */
                <div className="space-y-4 text-center select-none">
                  <div className="flex flex-col items-center">
                    <div className="h-14 w-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-500">
                      <CircleCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-3">¡Venta Registrada de Forma Exitosa!</h3>
                    <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mt-0.5">COMPROBANTE ELECTRÓNICO NÚMERO {saleSuccess.id}</p>
                  </div>

                  {/* Receipt Paper Card layout */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs font-mono space-y-3 max-h-56 overflow-y-auto">
                    <div className="text-center font-bold text-slate-400 border-b border-slate-200 pb-2 uppercase tracking-wider text-[11px]">
                      TIENDITAS BP - TICKET DE VENTA
                    </div>

                    <div className="space-y-1 text-slate-705 text-slate-700">
                      {saleSuccess.items.map((it, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between font-bold">
                          <span>{it.quantity}x {it.name}</span>
                          <span>${(it.quantity * it.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 font-bold">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal Compra:</span>
                        <span>${saleSuccess.subtotal.toFixed(2)}</span>
                      </div>
                      {saleSuccess.discount > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>Descuento Especial:</span>
                          <span>-${saleSuccess.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-950 text-sm font-extrabold pt-1">
                        <span>TOTAL LIQUIDADO:</span>
                        <span>${saleSuccess.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-450 leading-relaxed font-bold">
                      <div>Canal de Pago: <span className="uppercase text-slate-750 text-slate-755">{saleSuccess.paymentMethod === 'cash' ? 'Efectivo' : saleSuccess.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia Directa de Cuenta'}</span></div>
                      {saleSuccess.paymentMethod === 'cash' && saleSuccess.cashReceived !== undefined && (
                        <>
                          <div>Monto Recibido: <span className="text-slate-700">${saleSuccess.cashReceived.toFixed(2)}</span></div>
                          <div>Monto Cambio: <span className="text-emerald-700 font-extrabold">${saleSuccess.changePaid?.toFixed(2)}</span></div>
                        </>
                      )}
                      <div className="mt-1">Cajero: {saleSuccess.cashier}</div>
                      <div>Operaciones en: {activeStore?.name}</div>
                      <div>Hora registro: {new Date(saleSuccess.timestamp).toLocaleString('es-MX')}</div>
                    </div>
                  </div>

                  {/* Offline / cloud notice */}
                  <div className="bg-indigo-950/5 text-[#4f46e5] text-[10px] font-mono border border-[#4f46e5]/10 py-2.5 px-4 rounded-xl text-left uppercase flex items-center gap-1.5 leading-none">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 inline-block"></span>
                    <span>El inventario se sincronizó y el stock disponible fue reducido correspondientemente.</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCloseReceiptModal}
                      className="w-full bg-slate-905 bg-slate-900 hover:bg-slate-950 text-white py-3.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Confirmar y Regresar 🪐
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
