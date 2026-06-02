/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  User, 
  History, 
  X, 
  MapPin, 
  Shuffle, 
  Download, 
  Coins, 
  Sparkles,
  Users,
  Check,
  TrendingDown
} from 'lucide-react';
import { 
  Product, 
  Category, 
  Sale, 
  Store, 
  Seller, 
  StockTransfer, 
  StockAdjustment, 
  CashAudit 
} from '../types';

interface DashboardAdminProps {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  stores: Store[];
  sellers: Seller[];
  transfers: StockTransfer[];
  adjustments: StockAdjustment[];
  audits: CashAudit[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStores: (stores: Store[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
  onAddTransfer: (transfer: StockTransfer) => void;
  onAddAdjustment: (adjustment: StockAdjustment) => void;
  onUpdateAudits: (audits: CashAudit[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onResetToHome: () => void;
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onInstallApp?: () => void;
  showInstallButton?: boolean;
}

export default function DashboardAdmin({
  products,
  categories,
  sales,
  stores,
  sellers,
  transfers,
  adjustments,
  audits,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onUpdateStores,
  onUpdateSellers,
  onAddTransfer,
  onAddAdjustment,
  onUpdateAudits,
  onUpdateProducts,
  onResetToHome,
  onAddSale,
  onInstallApp,
  showInstallButton
}: DashboardAdminProps) {
  // Navigation Tabs matching 5 requests
  const [activeTab, setActiveTab] = useState<'dashboard' | 'precios' | 'inventario' | 'personal' | 'auditoria'>('dashboard');

  // Interactive local filter: specific mobile store unit (or all)
  const [selectedDashboardStore, setSelectedDashboardStore] = useState<string>('all');

  // Simulated download reports load states
  const [exportingType, setExportingType] = useState<'excel' | 'pdf' | null>(null);
  const [simulationPulse, setSimulationPulse] = useState(false);

  // New product master addition modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('alimentos');
  const [newProdPrice, setNewProdPrice] = useState('30.00');
  const [newProdStock, setNewProdStock] = useState('150');
  const [newProdMinStock, setNewProdMinStock] = useState('15');
  const [newProdEmoji, setNewProdEmoji] = useState('🍟');

  // Logistic forms states
  const [transferProdId, setTransferProdId] = useState('');
  const [transferFromStore, setTransferFromStore] = useState('');
  const [transferToStore, setTransferToStore] = useState('');
  const [transferQty, setTransferQty] = useState('10');

  const [adjustProdId, setAdjustProdId] = useState('');
  const [adjustStoreId, setAdjustStoreId] = useState('');
  const [adjustReason, setAdjustReason] = useState<'merma' | 'producto_dañado' | 'devolución'>('merma');
  const [adjustQty, setAdjustQty] = useState('5');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Shift & personal states
  const [showRosterModal, setShowRosterModal] = useState<Seller | null>(null);
  const [rosterStoreId, setRosterStoreId] = useState('');
  const [rosterEventName, setRosterEventName] = useState('');

  // Seller CRUD
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  // Pricelist matrix configuration state
  const [pricingActiveProdId, setPricingActiveProdId] = useState<string>(products[0]?.id || 'prod-papas');
  const [overrideStoreId, setOverrideStoreId] = useState<string>('store-a');
  const [overridePriceVal, setOverridePriceVal] = useState<string>('35.00');

  // Inspection receipt drawer
  const [selectedSaleReceipt, setSelectedSaleReceipt] = useState<Sale | null>(null);

  // Custom inline store adding
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreLocation, setNewStoreLocation] = useState('');

  // Filter sales based on selected Store
  const filteredSales = useMemo(() => {
    if (selectedDashboardStore === 'all') return sales;
    return sales.filter(s => s.storeId === selectedDashboardStore);
  }, [sales, selectedDashboardStore]);

  // Derived financials
  const revenueTotal = useMemo(() => {
    return filteredSales.reduce((acc, curr) => acc + curr.total, 0);
  }, [filteredSales]);

  const transactionsCount = filteredSales.length;
  const ticketAverage = transactionsCount > 0 ? (revenueTotal / transactionsCount) : 0;

  // Active alarms (products in selected store below warning threshold)
  const storeStockAlarms = useMemo(() => {
    const alarms: { productName: string; emoji: string; storeName: string; stock: number; min: number }[] = [];
    stores.forEach(st => {
      products.forEach(p => {
        const localStock = st.stock[p.id] !== undefined ? st.stock[p.id] : 0;
        if (localStock <= p.minStock) {
          alarms.push({
            productName: p.name,
            emoji: p.emoji,
            storeName: st.name,
            stock: localStock,
            min: p.minStock
          });
        }
      });
    });
    return alarms;
  }, [stores, products]);

  // Simulating instant sales generator
  const handleSimulateLiveSale = () => {
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    if (!randomStore) return;
    const activeProducts = products.filter(p => (randomStore.stock[p.id] || 0) > 0);
    if (activeProducts.length === 0) return;

    const randomProduct = activeProducts[Math.floor(Math.random() * activeProducts.length)];
    const priceCustom = randomStore.prices[randomProduct.id] || randomProduct.price;
    const saleQty = 1 + Math.floor(Math.random() * 3);

    const methods: ('cash' | 'card' | 'transfer')[] = ['cash', 'card', 'transfer'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];

    onAddSale({
      timestamp: new Date().toISOString(),
      storeId: randomStore.id,
      items: [
        {
          productId: randomProduct.id,
          name: randomProduct.name,
          price: priceCustom,
          quantity: saleQty
        }
      ],
      subtotal: priceCustom * saleQty,
      discount: 0,
      total: priceCustom * saleQty,
      paymentMethod: randomMethod,
      cashReceived: randomMethod === 'cash' ? Math.ceil(priceCustom * saleQty / 20) * 20 : undefined,
      changePaid: randomMethod === 'cash' ? (Math.ceil(priceCustom * saleQty / 20) * 20) - (priceCustom * saleQty) : undefined,
      cashier: sellers.find(s => s.assignedStoreId === randomStore.id)?.name || 'Cajero Live Sim'
    });

    setSimulationPulse(true);
    setTimeout(() => setSimulationPulse(false), 1500);
  };

  // Simulated Report Exports with real feedback
  const triggerExport = (type: 'excel' | 'pdf') => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      alert(`¡Éxito! El Reporte Estadístico del POS en formato ${type.toUpperCase()} ha sido compilado y descargado al almacenamiento local.`);
    }, 1800);
  };

  // Submit product creation
  const submitNewProd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(newProdPrice) || 30.0;
    const parsedStock = parseInt(newProdStock) || 100;
    const parsedMin = parseInt(newProdMinStock) || 15;

    onAddProduct({
      name: newProdName,
      sku: newProdSku.toUpperCase() || 'SKU-NEW',
      price: parsedPrice,
      category: newProdCategory,
      stock: parsedStock,
      minStock: parsedMin,
      emoji: newProdEmoji
    });

    // Populate initial allocation in our main stores as well
    const updatedStores = stores.map(store => ({
      ...store,
      stock: { ...store.stock, [`prod-${newProdSku}`]: Math.floor(parsedStock / 4) }
    }));
    onUpdateStores(updatedStores);

    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdSku('');
  };

  // Custom price override
  const handleSavePriceOverride = () => {
    const updated = stores.map(st => {
      if (st.id === overrideStoreId) {
        return {
          ...st,
          prices: {
            ...st.prices,
            [pricingActiveProdId]: parseFloat(overridePriceVal) || 30.00
          }
        };
      }
      return st;
    });
    onUpdateStores(updated);
    alert('Matriz de precio actualizada exitosamente.');
  };

  // Add store logic
  const handleAddNewStore = () => {
    if (!newStoreName) return;
    const newId = `store-${Date.now()}`;
    const initialStocks: Record<string, number> = {};
    products.forEach(p => { initialStocks[p.id] = 50; });

    const newStoreItem: Store = {
      id: newId,
      name: newStoreName,
      location: newStoreLocation || 'Ubicación Evento Móvil',
      status: 'active',
      prices: {},
      stock: initialStocks
    };

    onUpdateStores([...stores, newStoreItem]);
    alert(`Unidad de Ventas ${newStoreName} Dada de Alta exitosamente.`);
    setShowAddStore(false);
    setNewStoreName('');
    setNewStoreLocation('');
  };

  // Toggle store status
  const toggleStoreStatus = (id: string) => {
    const updated: Store[] = stores.map(st => {
      if (st.id === id) {
        return { 
          ...st, 
          status: (st.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive'
        };
      }
      return st;
    });
    onUpdateStores(updated);
  };

  // Create Seller Account
  const handleAddSellerSubmit = () => {
    if (!sellerName) return;
    const newS: Seller = {
      id: `sell-${Date.now()}`,
      name: sellerName,
      email: sellerEmail || 'ventas@nexuspos.com',
      status: 'active' as 'active' | 'suspended',
      assignedStoreId: stores[0]?.id || 'store-a',
      assignedEvent: 'Reserva General'
    };
    onUpdateSellers([...sellers, newS]);
    alert(`Cuenta de vendedor para ${sellerName} habilitada.`);
    setSellerName('');
    setSellerEmail('');
    setShowAddSeller(false);
  };

  // Suspend Seller Acc
  const toggleSellerStatus = (id: string) => {
    const updated: Seller[] = sellers.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          status: (s.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended'
        };
      }
      return s;
    });
    onUpdateSellers(updated);
  };

  // Rostering / shifts
  const applyShiftRoster = () => {
    if (!showRosterModal) return;
    const updated: Seller[] = sellers.map(s => {
      if (s.id === showRosterModal.id) {
        return {
          ...s,
          assignedStoreId: rosterStoreId,
          assignedEvent: rosterEventName || 'Evento Pendiente'
        };
      }
      return s;
    });
    onUpdateSellers(updated);
    alert('Turno de operación asignado y notificado al vendedor.');
    setShowRosterModal(null);
  };

  // Live Stock logistics
  const executeTransfer = () => {
    if (!transferProdId || !transferFromStore || !transferToStore || transferFromStore === transferToStore) {
      alert('Por favor seleccione tiendas distintas y un producto válido.');
      return;
    }
    const qty = parseInt(transferQty) || 0;
    const fromStoreObj = stores.find(s => s.id === transferFromStore);
    const available = fromStoreObj?.stock[transferProdId] || 0;

    if (qty > available) {
      alert(`No es posible transferir. La unidad de origen solo cuenta con ${available} unidades de este producto.`);
      return;
    }

    // Execute transfer updates
    const updatedStores = stores.map(st => {
      if (st.id === transferFromStore) {
        return { ...st, stock: { ...st.stock, [transferProdId]: Math.max((st.stock[transferProdId] || 0) - qty, 0) } };
      }
      if (st.id === transferToStore) {
        return { ...st, stock: { ...st.stock, [transferProdId]: (st.stock[transferProdId] || 0) + qty } };
      }
      return st;
    });

    onUpdateStores(updatedStores);

    // Save transfer log log
    onAddTransfer({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: transferProdId,
      fromStoreId: transferFromStore,
      toStoreId: transferToStore,
      quantity: qty
    });

    alert('Transferencia de mercadería procesada exitosamente.');
  };

  // Loss and spoilage adjustment
  const executeLossAdjustment = () => {
    if (!adjustProdId || !adjustStoreId) {
      alert('Seleccione un producto y una tienda válida.');
      return;
    }
    const qty = parseInt(adjustQty) || 0;

    const updatedStores = stores.map(st => {
      if (st.id === adjustStoreId) {
        const curr = st.stock[adjustProdId] || 0;
        return {
          ...st,
          stock: { ...st.stock, [adjustProdId]: Math.max(curr - qty, 0) }
        };
      }
      return st;
    });

    onUpdateStores(updatedStores);

    onAddAdjustment({
      id: `adj-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: adjustProdId,
      storeId: adjustStoreId,
      quantity: qty,
      reason: adjustReason,
      notes: adjustNotes || 'Ajuste general de stock en operaciones'
    });

    alert('Registro de merma de inventario asentado en libros.');
    setAdjustNotes('');
  };

  // Close Register Audit
  const handleResolveAndCloseAudit = (auditId: string, reported: string) => {
    const closedVal = parseFloat(reported) || 0;
    const updated = audits.map(aud => {
      if (aud.id === auditId) {
        const diff = closedVal - aud.expectedCash;
        return {
          ...aud,
          reportedCash: closedVal,
          difference: diff,
          isClosed: true
        };
      }
      return aud;
    });
    onUpdateAudits(updated);
    alert('Arqueo de caja auditado y cerrado oficialmente.');
  };

  // Preset Emojis lists
  const EMOJIGROUP = ['🍟', '🍔', '🍺', '🥤', '☕', '🥐', '🌮', '🎒', '👕', '🔋', '🔌', '🧉', '📓', '🕶️', '🧴'];

  return (
    <div id="admin-layout" className="min-h-screen bg-slate-50/60 flex flex-col md:flex-row font-sans">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside id="desktop-sidebar" className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex sticky top-0 h-screen p-5 shrink-0 z-40">
        <div className="space-y-6">
          <div className="flex flex-col items-center py-4 border-b border-slate-100">
            <img 
              src="https://cossma.com.mx/bp.jpeg" 
              alt="Logo Tienditas BP" 
              className="h-14 w-auto object-contain mb-3 rounded-lg shadow-sm" 
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-black text-slate-800 tracking-tight font-display text-center uppercase">
              Administración
            </span>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Tienditas BP v3.0</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Monitoreo Live', icon: TrendingUp },
              { id: 'precios', label: 'Multi-Tienda & Precios', icon: MapPin },
              { id: 'inventario', label: 'Logística & Merma', icon: Package },
              { id: 'personal', label: 'Personal & Turnos', icon: Users },
              { id: 'auditoria', label: 'Caja & Auditoría', icon: Coins }
            ].map(tb => {
              const Icon = tb.icon;
              const isSelected = activeTab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => setActiveTab(tb.id as any)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tb.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          {showInstallButton && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="w-full bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📱 Instalar App</span>
            </button>
          )}

          <button
            onClick={onResetToHome}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quitar Rol</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main id="main-content-panel" className="flex-grow flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-6">
        
        {/* MOBILE TOP NAV (Hidden on desktop) */}
        <header id="mobile-top-header" className="bg-white border-b border-slate-150/60 py-3 px-4 flex items-center justify-between md:hidden sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <img 
              src="https://cossma.com.mx/bp.jpeg" 
              alt="Logo Tienditas BP" 
              className="h-8 w-auto object-contain rounded" 
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-black tracking-tight text-slate-800 uppercase font-display">Tienditas BP</span>
          </div>
          <button
            onClick={onResetToHome}
            className="border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 font-semibold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
          >
            Quitar Rol
          </button>
        </header>

        {/* WORKSPACE BODY INNER SCROLLER */}
        <div id="workspace-scroller-inner" className="p-4 md:p-8 space-y-6 flex-grow border-0">
          
          <div id="admin-subheader-row" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Consola del Administrador
              </span>
              <h2 className="text-2xl font-bold font-display text-slate-800 mt-2 tracking-tight">Gestión del Canal de Eventos Móviles</h2>
              <p className="text-slate-400 text-xs mt-0.5">Control de las 4 tiendas móviles, lista de precios matrices y cuadrantes de caja.</p>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === 'dashboard' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSimulateLiveSale}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Simular Venta en Vivo</span>
                </motion.button>
              )}
            </div>
          </div>

      {/* 3. Tab contents implementations */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: Realtime Monitoring and Revenue Streams */}
        {activeTab === 'dashboard' && (
          <motion.div 
            key="tab-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter selectors and simulations indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-500 font-semibold font-mono">Filtrar Canal Evento:</span>
                <select
                  value={selectedDashboardStore}
                  onChange={(e) => setSelectedDashboardStore(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="all">🌐 Consolidado General (4 Unidades)</option>
                  {stores.map(st => (
                    <option key={st.id} value={st.id}>🚚 {st.name} ({st.status === 'active' ? 'En Vivo' : 'Inactivo'})</option>
                  ))}
                </select>
              </div>

              {simulationPulse && (
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold font-mono border border-emerald-100 px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                  🔴 Live Stream: ¡Nueva Venta Registrada!
                </span>
              )}
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Ingresos Netos Evento</span>
                <span className="text-3xl font-bold font-mono text-slate-800 block mt-2">${revenueTotal.toFixed(2)}</span>
                <p className="text-[10px] text-slate-400 mt-1">Suma filtrada de cobros registrados</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Transacciones Realizadas</span>
                <span className="text-3xl font-bold font-mono text-slate-800 block mt-2">{transactionsCount} <span className="text-xs font-normal">ventas</span></span>
                <p className="text-[10px] text-slate-400 mt-1">Registros emitidos por cajeros</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Ticket Medio Promedio</span>
                <span className="text-3xl font-bold font-mono text-slate-800 block mt-2">${ticketAverage.toFixed(2)}</span>
                <p className="text-[10px] text-slate-400 mt-1">Valor medio por transacción</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)] border-r-4 border-r-indigo-500">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Alertas de Inventario Crítico</span>
                <span className={`text-3xl font-bold font-mono block mt-2 ${storeStockAlarms.length > 0 ? 'text-amber-600 font-black' : 'text-slate-800'}`}>
                  {storeStockAlarms.length} <span className="text-xs font-normal">bajos</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Productos que requieren recarga</p>
              </div>
            </div>

            {/* Graphics and lists splitting */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left col: live list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-850">Flujo de Ventas Recientes (En Vivo)</h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">Historial directo de tickets cobrados en cualquier unidad activa.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => triggerExport('excel')}
                      disabled={exportingType !== null}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                      title="Exportar a Excel"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredSales.length === 0 ? (
                    <div className="text-center py-12 text-xs font-mono text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                      No hay transacciones aún para el filtro activo.
                    </div>
                  ) : (
                    filteredSales.map(sl => {
                      const storeObj = stores.find(s => s.id === sl.storeId);
                      return (
                        <div 
                          key={sl.id}
                          onClick={() => setSelectedSaleReceipt(sl)}
                          className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:border-indigo-650/40 hover:bg-slate-50/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                              <History className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-indigo-650">#{sl.id}</span>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                  {sl.paymentMethod}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-700 mt-0.5 whitespace-nowrap">
                                Cajero: <span className="font-semibold">{sl.cashier}</span> • {storeObj?.name || 'Mobil Unit'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-slate-800 block">${sl.total.toFixed(2)}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(sl.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Right column: active inventory levels warning panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-850">Alertas Críticas de Stock por Tienda</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Control de quiebre de stock en sucursales.</p>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
                  {storeStockAlarms.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-mono text-[11px] bg-slate-50 rounded-2xl p-6">
                      🟢 Excelente. Todas las tiendas móviles cuentan con stock saludable actualmente para operar sus eventos.
                    </div>
                  ) : (
                    storeStockAlarms.map((alm, idx) => (
                      <div 
                        key={idx}
                        className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3 flex.col items-start gap-1 space-y-1"
                      >
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>{alm.emoji} {alm.productName}</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono pl-4.5">
                          <p>Tienda: {alm.storeName}</p>
                          <p className="text-amber-700 font-bold">Disponible: {alm.stock} ud. (Mín. {alm.min})</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: Store Rosters & Multi-unit pricing lists matrices */}
        {activeTab === 'precios' && (
          <motion.div 
            key="tab-precios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Store Manager header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Control de las 4 Sucursales/Tiendas Móviles</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Active, desactive y configure listas independientes de precios.</p>
              </div>
              <button 
                onClick={() => setShowAddStore(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Alta Nueva Sucursal</span>
              </button>
            </div>

            {/* Stores grid cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stores.map(st => {
                const sellerObj = sellers.find(s => s.assignedStoreId === st.id);
                return (
                  <div 
                    key={st.id}
                    className="bg-white rounded-3xl border border-slate-100 p-5.5 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          st.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {st.status === 'active' ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                        
                        <button
                          onClick={() => toggleStoreStatus(st.id)}
                          className="text-[10px] underline text-indigo-650 font-bold hover:text-indigo-800 cursor-pointer"
                        >
                          {st.status === 'active' ? 'Alternar' : 'Activar'}
                        </button>
                      </div>

                      <h4 className="text-base font-semibold text-slate-800 mt-3 font-display">{st.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{st.location}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-50 space-y-1">
                      <p className="text-[10px] uppercase text-slate-400 font-bold font-mono">Personal Asignado:</p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{sellerObj ? sellerObj.name : 'Sin operador'}</span>
                      </div>
                      {sellerObj && (
                        <p className="text-[9px] text-indigo-500 font-mono font-medium">{sellerObj.assignedEvent}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Price Override Matrix Configuration Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <div>
                <h3 className="font-semibold text-slate-850">Matriz de Precios Flexibles para Eventos</h3>
                <p className="text-[11px] text-slate-450 mt-0.5">Asigne listas de precios independientes. Modifique cuánto cuesta un producto en cada unidad móvil de acuerdo al margen de ganancia de cada evento.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left product selector */}
                <div className="md:col-span-5 space-y-2 max-h-96 overflow-y-auto bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">1. Seleccione Producto de Catálogo</span>
                  {products.map(p => {
                    const isSelected = p.id === pricingActiveProdId;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setPricingActiveProdId(p.id)}
                        className={`p-3 rounded-xl cursor-pointer flex items-center justify-between border transition-all ${
                          isSelected ? 'bg-white border-indigo-650/40 shadow-xs ring-1 ring-indigo-500/10' : 'bg-transparent border-transparent hover:bg-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{p.emoji}</span>
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">{p.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">{p.sku}</span>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-slate-505">
                          Base: ${p.price.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Right: pricing overrides matrix editor */}
                <div className="md:col-span-7 bg-slate-50/50 p-5 rounded-2xl border border-slate-150 space-y-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">2. Configurar Lista de Precios</span>
                  
                  <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 font-bold uppercase uppercase tracking-wider">
                          <th className="py-3 px-4">Tienda Móvil</th>
                          <th className="py-3 px-4 text-center">Precio Base</th>
                          <th className="py-3 px-4 text-right">Precio en este Evento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {stores.map(st => {
                          const productPriceBase = products.find(p => p.id === pricingActiveProdId)?.price || 30.00;
                          const currentOverride = st.prices[pricingActiveProdId] !== undefined ? st.prices[pricingActiveProdId] : productPriceBase;
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-4 font-sans font-medium text-slate-700">🚚 {st.name}</td>
                              <td className="py-2.5 px-4 text-center text-slate-400">${productPriceBase.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-right text-indigo-650 font-bold">
                                ${currentOverride.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Form to override custom price */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-450 block mb-1">Destinatario</label>
                      <select
                        value={overrideStoreId}
                        onChange={(e) => setOverrideStoreId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                      >
                        {stores.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-455 block mb-1">Nuevo Precio Overwrite ($)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={overridePriceVal}
                        onChange={(e) => setOverridePriceVal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold font-mono focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={handleSavePriceOverride}
                      className="bg-slate-900 border border-slate-950 hover:bg-black text-white font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer text-center"
                    >
                      Asignar Precio
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: Logistics & stock warehousing & adjustments */}
        {activeTab === 'inventario' && (
          <motion.div 
            key="tab-inventario"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Catálogo Centralizado de Productos y Logística</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Un total de {products.length} productos configurados en el maestro global de inventarios.</p>
              </div>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Producto a Maestro</span>
              </button>
            </div>

            {/* Split row: Logistics tools vs Inventory List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left col: Logistics transactions panels (5/12 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Panel 1: Inter-store stock transfers (Mover stock entre tiendas) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase font-mono text-indigo-600">Transferencias entre Tiendas</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Envíe stock sobrante a otra unidad con mayor venta.</p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Producto a Mover</label>
                      <select 
                        value={transferProdId}
                        onChange={(e) => setTransferProdId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="">Seleccione artículo...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Origen</label>
                        <select 
                          value={transferFromStore}
                          onChange={(e) => setTransferFromStore(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="">Origen...</option>
                          {stores.map(st => (
                            <option key={st.id} value={st.id}>🚚 {st.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Destino</label>
                        <select 
                          value={transferToStore}
                          onChange={(e) => setTransferToStore(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="">Destino...</option>
                          {stores.map(st => (
                            <option key={st.id} value={st.id}>🚚 {st.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Cantidad de unidades</label>
                      <input 
                        type="number"
                        value={transferQty}
                        onChange={(e) => setTransferQty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-mono focus:outline-none"
                        min="1"
                      />
                    </div>

                    <button 
                      onClick={executeTransfer}
                      className="w-full bg-slate-900 border border-slate-950 hover:bg-black text-white font-semibold py-2 rounded-xl cursor-pointer text-center"
                    >
                      Procesar Envío Logístico
                    </button>
                  </div>
                </div>

                {/* Panel 2: Adjustments & Spoilage/Mermas */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase font-mono text-red-600 font-black">Ajustes & Registro de Merma</h4>
                    <p className="text-[11px] text-slate-440 mt-0.5">Disminuya stock por mermas en alimentos o roturas.</p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Artículo Afectado</label>
                      <select 
                        value={adjustProdId}
                        onChange={(e) => setAdjustProdId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="">Seleccione...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-455 mb-1">Ubicación Tienda Móvil</label>
                      <select 
                        value={adjustStoreId}
                        onChange={(e) => setAdjustStoreId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="">Seleccione sucursal...</option>
                        {stores.map(st => (
                          <option key={st.id} value={st.id}>🚚 {st.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Unidades</label>
                        <input 
                          type="number"
                          value={adjustQty}
                          onChange={(e) => setAdjustQty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Motivo</label>
                        <select 
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="merma">🌭 Merma Alimentos</option>
                          <option value="producto_dañado">💔 Dañado / Roto</option>
                          <option value="devolución">🔄 Devolución</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-450 mb-1">Comentarios / Bitácora</label>
                      <input 
                        type="text"
                        value={adjustNotes}
                        onChange={(e) => setAdjustNotes(e.target.value)}
                        placeholder="Croissants aplastados en camioneta."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={executeLossAdjustment}
                      className="w-full bg-red-500 hover:bg-red-650 hover:bg-red-600 text-white font-semibold py-2 rounded-xl cursor-pointer text-center"
                    >
                      Reportar Pérdida / Pérdidas
                    </button>
                  </div>
                </div>

              </div>

              {/* Right column: General warehouse product master catalog (8/12 cols) */}
              <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800">Catálogo Global Maestro</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Control de SKU global y existencias generales.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-450 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Producto</th>
                        <th className="py-3 px-4">SKU ID</th>
                        <th className="py-3 px-4 text-center">Stock Almacén Central</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <span className="text-xl">{p.emoji}</span>
                            <div>
                              <span className="font-semibold text-slate-850 block">{p.name}</span>
                              <span className="text-[10px] uppercase text-slate-450 font-mono">{p.category}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{p.sku}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{p.stock}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                const qStr = prompt(`Establecer nuevo nivel de existencias para [${p.name}] en Almacén Central:`, p.stock.toString());
                                if (qStr !== null) {
                                  const parsed = parseInt(qStr);
                                  if (!isNaN(parsed)) onUpdateStock(p.id, parsed);
                                }
                              }}
                              className="text-[10px] text-indigo-650 hover:text-indigo-850 underline font-semibold transition-colors cursor-pointer"
                            >
                              Modificar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: Users and personal rosters */}
        {activeTab === 'personal' && (
          <motion.div 
            key="tab-personal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* CRUD and title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Organigrama y Control de Accesos de Vendedores</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Asigne turnos para cada punto de venta móvil e inhabilite accesos temporalmente.</p>
              </div>
              <button 
                onClick={() => setShowAddSeller(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Habilitar Nuevo Vendedor</span>
              </button>
            </div>

            {/* Employee cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sellers.map(sl => {
                const assignedStore = stores.find(st => st.id === sl.assignedStoreId);
                return (
                  <div 
                    key={sl.id}
                    className="bg-white rounded-3xl border border-slate-100 p-5.5 shadow-xs flex justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold font-display">
                          {sl.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{sl.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">{sl.email}</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Turno de Operación Actual:</p>
                        <p className="text-xs font-semibold text-slate-700 mt-1">🚚 {assignedStore ? assignedStore.name : 'Unidad no asignada'}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold font-mono bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded-md mt-1 w-fit">
                          🎪 {sl.assignedEvent}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        sl.status === 'active' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-red-50 text-red-700 font-semibold'
                      }`}>
                        {sl.status === 'active' ? 'ACCESO LIVE' : 'SUSPENDIDO'}
                      </span>

                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setRosterStoreId(sl.assignedStoreId || stores[0]?.id || 'store-a');
                            setRosterEventName(sl.assignedEvent || 'Evento Semanal');
                            setShowRosterModal(sl);
                          }}
                          className="text-[11px] underline text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
                        >
                          Asignar Turno
                        </button>
                        
                        <button
                          onClick={() => toggleSellerStatus(sl.id)}
                          className="text-[11px] underline text-slate-450 hover:text-red-500 font-bold cursor-pointer"
                        >
                          {sl.status === 'active' ? 'Suspender' : 'Reactivar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 5: Cash closures, and Reconciliation auditing */}
        {activeTab === 'auditoria' && (
          <motion.div 
            key="tab-auditoria"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-3xl border border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Auditoría Financiera de Cierres de Caja</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Controle la caja chica de eventos. El sistema recalcula en tiempo real cuánto efectivo debe estar presente basado en boletas generadas.</p>
            </div>

            <div className="space-y-4">
              {audits.map(aud => {
                const storeObj = stores.find(st => st.id === aud.storeId);
                const hasDiscrepancy = aud.difference !== 0;

                return (
                  <div 
                    key={aud.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${aud.isClosed ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
                          {storeObj ? storeObj.name : 'Terminal Evento'} 
                          <span className="text-[10px] text-slate-400 font-mono font-normal">({aud.id})</span>
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block uppercase text-[10px]">Cajero Principal</span>
                          <span className="text-slate-700 font-sans font-semibold">{aud.cashier}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase text-[10px]">Ingresos Tarjeta</span>
                          <span className="text-slate-700 font-semibold">${aud.reportedCards.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase text-[10px]">Ingresos Transferencia</span>
                          <span className="text-slate-700 font-semibold">${aud.reportedTransfers.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase text-[10px]">Efectivo POS Esperado</span>
                          <span className="text-slate-900 font-bold">${aud.expectedCash.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end justify-between gap-3">
                      <div>
                        {aud.isClosed ? (
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <span className="bg-slate-100 text-slate-600 font-bold text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase">
                              Caja Cerrada & Auditoría Lista
                            </span>

                            <div className="text-right text-xs mt-1">
                              <span className="font-mono text-slate-500">Dinero Reportado: </span>
                              <span className="font-mono text-slate-800 font-bold">${aud.reportedCash.toFixed(2)}</span>
                              <div className="font-mono text-[10px] mt-0.5">
                                {hasDiscrepancy ? (
                                  <span className={aud.difference < 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>
                                    Diferencia: ${aud.difference.toFixed(2)} ({aud.difference < 0 ? 'Faltante' : 'Sobrante'})
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-semibold">Caja Cuadrada (0.00)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-bold text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase animate-pulse inline-block">
                            Caja Abierta y Operando
                          </span>
                        )}
                      </div>

                      {!aud.isClosed && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const repStr = prompt(`Verifique saldo e indique Billete/Efectivo neto entregado en sobre físico para [${aud.cashier}] (Esperado: $${aud.expectedCash}):`, aud.expectedCash.toString());
                              if (repStr !== null) {
                                handleResolveAndCloseAudit(aud.id, repStr);
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                          >
                            Auditar Caja y Cuadrar Dinero
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* MODAL 1: ADD PRODUCT TO MASTER */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProductModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-md z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold flex items-center gap-1.5 text-slate-800">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Alta de Producto Global
                </h4>
                <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={submitNewProd} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Nombre</label>
                  <input 
                    type="text" 
                    required 
                    value={newProdName} 
                    onChange={(e) => setNewProdName(e.target.value)} 
                    placeholder="Ej. Papas con Cheddar" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">SKU</label>
                    <input 
                      type="text" 
                      required 
                      value={newProdSku} 
                      onChange={(e) => setNewProdSku(e.target.value)} 
                      placeholder="Ej. ALM-CHP-011" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Categoría</label>
                    <select 
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none font-semibold text-slate-700"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Precio Base</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newProdPrice} 
                      onChange={(e) => setNewProdPrice(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Stock Maestro</label>
                    <input 
                      type="number" 
                      value={newProdStock} 
                      onChange={(e) => setNewProdStock(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Mín. Alerta</label>
                    <input 
                      type="number" 
                      value={newProdMinStock} 
                      onChange={(e) => setNewProdMinStock(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 block">Iconografía / Emoji</label>
                  <select
                    value={newProdEmoji}
                    onChange={(e) => setNewProdEmoji(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                  >
                    {EMOJIGROUP.map(em => (
                      <option key={em} value={em}>{em} Símbolo</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl cursor-pointer text-center"
                >
                  Agregar a Catálogo Principal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: SHIFT ASSIGNMENT ROSTER */}
      <AnimatePresence>
        {showRosterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRosterModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-sm z-10 space-y-4"
            >
              <div>
                <h4 className="font-bold text-slate-800">Asignación de Turno de Trabajo</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Configure la terminal y evento para <strong>{showRosterModal.name}</strong>.</p>
              </div>

              <div className="space-y-3 t-xs text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Terminal de Punto de Venta</label>
                  <select 
                    value={rosterStoreId}
                    onChange={(e) => setRosterStoreId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none mt-1"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>🚚 {st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Nombre del Evento Activo</label>
                  <input 
                    type="text" 
                    value={rosterEventName}
                    onChange={(e) => setRosterEventName(e.target.value)}
                    placeholder="Ej. Festival Rock CDMX / Feria Escolar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 text-xs">
                  <button 
                    onClick={() => setShowRosterModal(null)}
                    className="px-3.5 py-1.5 text-slate-550 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    Salir
                  </button>

                  <button 
                    onClick={applyShiftRoster}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4.5 py-1.5 rounded-xl cursor-pointer"
                  >
                    Confirmar Turno
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: INVOICE / SALE DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedSaleReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSaleReceipt(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-sm z-10 space-y-4"
            >
              <div className="text-center pb-3 border-b border-slate-100">
                <span className="text-2xl">🧾</span>
                <h4 className="text-sm font-bold text-slate-800 mt-1 uppercase">Nexus POS Digital Receipt</h4>
                <p className="text-[10px] text-slate-400">Terminal Sincronizada • Sucesores S.A.</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Boleta ID: </span>
                  <span className="font-bold text-slate-800">#{selectedSaleReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cajero: </span>
                  <span className="font-bold text-slate-700">{selectedSaleReceipt.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Forma de Pago: </span>
                  <span className="font-bold uppercase text-slate-800">{selectedSaleReceipt.paymentMethod}</span>
                </div>

                <div className="border-t border-b border-slate-100 py-2.5 my-2 space-y-1">
                  {selectedSaleReceipt.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-slate-705">
                      <span>{it.quantity}x {it.name}</span>
                      <span>${(it.quantity * it.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold text-sm text-slate-800">
                  <span>Monto Total:</span>
                  <span className="font-sans text-indigo-650 font-black">${selectedSaleReceipt.total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSaleReceipt(null)}
                className="w-full bg-slate-900 border border-slate-950 hover:bg-black text-white font-semibold py-2 rounded-xl text-xs cursor-pointer text-center mt-2"
              >
                Cerrar Boleta
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: ADD STORE PROFILE */}
      <AnimatePresence>
        {showAddStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddStore(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-sm z-10 space-y-4"
            >
              <div>
                <h4 className="font-bold text-slate-850">Dar de Alta Tienda Móvil</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Incorpore una unidad adicional de eventos al sistema general.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Nombre de la Sucursal</label>
                  <input 
                    type="text" 
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="Ej. Tienda Móvil E (Showroom)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Sede / Ubicación del Evento</label>
                  <input 
                    type="text" 
                    value={newStoreLocation}
                    onChange={(e) => setNewStoreLocation(e.target.value)}
                    placeholder="Ej. Auditorio Nacional CDMX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setShowAddStore(false)} className="px-3.5 py-1.5 text-slate-550 cursor-pointer">Cancelar</button>
                  <button onClick={handleAddNewStore} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4.5 py-1.5 rounded-xl cursor-pointer">Registrar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: ADD SELLER */}
      <AnimatePresence>
        {showAddSeller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSeller(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-sm z-10 space-y-4"
            >
              <div>
                <h4 className="font-bold text-slate-850">Habilitar Cuenta de Vendedor</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Configure accesos para un miembro nuevo de la fuerza de ventas.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Nombre Completo del Operador</label>
                  <input 
                    type="text" 
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Ej. Fernando Ruiz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Correo Electrónico de Identificación</label>
                  <input 
                    type="email" 
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    placeholder="Ej. fernando@nexuspos.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setShowAddSeller(false)} className="px-3.5 py-1.5 text-slate-550 cursor-pointer">Cancelar</button>
                  <button onClick={handleAddSellerSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4.5 py-1.5 rounded-xl cursor-pointer">Dar de Alta</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        </div>
      </main>

      {/* 3. MOBILE STICKY BOTTOM TAB NAVIGATION */}
      <div id="mobile-tab-navigation" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40 flex justify-around items-center px-1 pb-safe shadow-lg">
        {[
          { id: 'dashboard', label: 'Live', icon: TrendingUp },
          { id: 'precios', label: 'Precios', icon: MapPin },
          { id: 'inventario', label: 'Stock', icon: Package },
          { id: 'personal', label: 'Personal', icon: Users },
          { id: 'auditoria', label: 'Cajas', icon: Coins }
        ].map(tb => {
          const Icon = tb.icon;
          const isSelected = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id as any)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                isSelected ? 'text-indigo-600 scale-105 font-extrabold' : 'text-slate-450 hover:text-slate-650'
              }`}
            >
              <div className={`p-1 rounded-lg ${isSelected ? 'bg-indigo-50' : 'bg-transparent'}`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="mt-0.5">{tb.label}</span>
            </button>
          )
        })}
      </div>

    </div>
  );
}
