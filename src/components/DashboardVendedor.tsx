/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  ShoppingBag
} from 'lucide-react';
import { Product, Category, Sale, SaleItem, Store, Seller } from '../types';

interface DashboardVendedorProps {
  products: Product[];
  categories: Category[];
  stores: Store[];
  sellers: Seller[];
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onResetToHome: () => void;
  onInstallApp?: () => void;
  showInstallButton?: boolean;
}

export default function DashboardVendedor({
  products,
  categories,
  stores,
  sellers,
  onAddSale,
  onResetToHome,
  onInstallApp,
  showInstallButton
}: DashboardVendedorProps) {
  // POS Search and Category filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Currently authenticated profile / seller
  const [activeSellerId, setActiveSellerId] = useState<string>(sellers[0]?.id || 'sell-carlos');
  
  // Resolve active cashier profile and store details dynamically
  const activeSeller = useMemo(() => {
    return sellers.find(s => s.id === activeSellerId) || sellers[0];
  }, [sellers, activeSellerId]);

  const activeStore = useMemo(() => {
    if (!activeSeller) return stores[0];
    return stores.find(st => st.id === activeSeller.assignedStoreId) || stores[0];
  }, [stores, activeSeller]);

  // Active Cart State (Local inside Vendedor Dashboard)
  const [cart, setCart] = useState<SaleItem[]>([]);
  
  // Custom Discount percentage
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Cashier name solved dynamically
  const cashierName = activeSeller ? activeSeller.name : 'Cajero General';

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

  // Handle Cart Management
  const addToCart = (product: Product) => {
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
          return prev; // stock limit hit!
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

  // Helper helper to inspect quantity in active cart
  const getItemQtyInCart = (productId: string): number => {
    const found = cart.find(item => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  // Totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const total = useMemo(() => {
    return Math.max(subtotal - discountAmount, 0);
  }, [subtotal, discountAmount]);

  // Cash change calculations
  const parsedCashReceived = parseFloat(cashReceived) || 0;
  const cashChange = useMemo(() => {
    if (parsedCashReceived < total) return 0;
    return parsedCashReceived - total;
  }, [parsedCashReceived, total]);

  // Preset cash shortcuts
  const CASH_SHORTCUTS = [
    { value: total, label: 'Justo' },
    { value: Math.ceil(total / 5) * 5, label: `$${Math.ceil(total / 5) * 5}` },
    { value: Math.ceil(total / 10) * 10, label: `$${Math.ceil(total / 10) * 10}` },
    { value: Math.ceil(total / 50) * 50, label: `$${Math.ceil(total / 50) * 50}` },
    { value: Math.ceil(total / 100) * 100, label: `$${Math.ceil(total / 100) * 100}` }
  ];

  // Process and file final payment
  const handleFinalizeSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && parsedCashReceived < total) {
      alert('El efectivo recibido es inferior al total a pagar.');
      return;
    }

    const saleRecord: Omit<Sale, 'id'> = {
      timestamp: new Date().toISOString(),
      storeId: activeStore ? activeStore.id : 'store-a',
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
      cashier: cashierName,
    };

    // Callback which saves in dynamic local store, updates stocks, and returns full registered sale with generated ID
    onAddSale(saleRecord);

    // Track state to show success ticket screen
    const registeredSale: Sale = {
      ...saleRecord,
      id: `V-${Math.floor(1000 + Math.random() * 9000)}`, // temporary visualization ID
    };

    setSaleSuccess(registeredSale);
  };

  // Safe release and reset
  const handleCloseSuccessScreen = () => {
    setCart([]);
    setDiscountPercent(0);
    setCashReceived('');
    setSaleSuccess(null);
    setShowCheckoutModal(false);
  };

  return (
    <div id="vendedor-dashboard-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      
      {/* Navbar Banner */}
      <header className="bg-white border-b border-slate-100 py-3 px-4 md:py-3.5 md:px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              id="vendedor-home-btn"
              onClick={onResetToHome}
              className="p-1.5 md:p-2 -ml-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 group font-mono text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            
            {/* Unencapsulated Rectangular Complete Brand Logo */}
            <img 
              src="https://cossma.com.mx/bp.jpeg" 
              alt="Logo Tienditas BP" 
              className="h-8 md:h-10 w-auto object-contain rounded" 
              referrerPolicy="no-referrer"
            />
            
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div>
              <span className="text-[9px] md:text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block">
                {activeStore?.name}
              </span>
              <span className="text-[8px] md:text-[10px] text-slate-400 font-mono block mt-0.5 max-w-[120px] md:max-w-none truncate">
                🎪 {activeSeller?.assignedEvent || 'Evento General'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {showInstallButton && onInstallApp && (
              <button
                onClick={onInstallApp}
                className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] md:text-xs py-1.5 px-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <span>📱 Instalar</span>
              </button>
            )}

            {/* Cashier identification */}
            <div className="flex items-center space-x-1 md:space-x-2 text-[10px] md:text-xs bg-slate-100 px-2 md:px-3 py-1.5 rounded-xl border border-slate-150">
              <User className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500 shrink-0" />
              <select
                value={activeSellerId}
                onChange={(e) => {
                  setActiveSellerId(e.target.value);
                  setCart([]);
                }}
                className="bg-transparent border-none text-slate-800 font-semibold focus:outline-none cursor-pointer text-[10px] md:text-xs"
              >
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>
                    👤 {s.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main split work screen */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Catalog panel (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
          
          {/* Filtering and search row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="pos-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            {/* Quick Category filter tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                  selectedCategory === 'todos' 
                    ? 'bg-slate-950 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                    selectedCategory === c.id 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div id="catalog-grid" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 text-xs font-mono">
                No se encontraron productos disponibles en esta categoría.
              </div>
            ) : (
              filteredProducts.map(product => {
                const localPrice = activeStore?.prices[product.id] !== undefined ? activeStore.prices[product.id] : product.price;
                const localStock = activeStore?.stock[product.id] !== undefined ? activeStore.stock[product.id] : 0;
                const qtyInCart = getItemQtyInCart(product.id);
                const isOutOfStock = localStock <= 0;
                const isLimitHit = qtyInCart >= localStock;
                const categoryObj = categories.find(c => c.id === product.category);

                return (
                  <motion.div
                    key={product.id}
                    id={`pos-card-${product.id}`}
                    whileHover={!isOutOfStock ? { y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' } : {}}
                    className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all relative ${
                      isOutOfStock 
                        ? 'border-slate-100 opacity-60' 
                        : qtyInCart > 0 
                          ? 'border-slate-900 ring-1 ring-slate-900/5' 
                          : 'border-slate-100'
                    }`}
                  >
                    {/* Floating Counter Badge */}
                    {qtyInCart > 0 && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-2.5 right-2.5 bg-slate-950 text-white font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs"
                      >
                        {qtyInCart}
                      </motion.span>
                    )}

                    <div className="space-y-2">
                      {/* Product Graphic Badge */}
                      <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center text-3xl select-none mb-2 border border-slate-100">
                        {product.emoji}
                      </div>

                      {/* Info lines */}
                      <div>
                        {categoryObj && (
                          <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                            {categoryObj.name}
                          </span>
                        )}
                        <h3 className="font-medium text-slate-900 text-xs md:text-sm leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5 uppercase">
                          {product.sku}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-end justify-between border-t border-slate-50 mt-4">
                      {/* Price & availability */}
                      <div>
                        <span className="block font-mono font-bold text-slate-900 text-xs md:text-sm">
                          ${localPrice.toFixed(2)}
                        </span>
                        <span className={`text-[10px] block ${isOutOfStock ? 'text-red-500 font-bold' : isLimitHit ? 'text-amber-500 font-medium' : 'text-slate-400 font-mono'}`}>
                          {isOutOfStock ? 'No Stock' : `${localStock - qtyInCart} disp.`}
                        </span>
                      </div>

                      {/* Operational Quick Add Button */}
                      <button
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock || isLimitHit}
                        className={`p-2 rounded-xl transition-all ${
                          isOutOfStock 
                            ? 'bg-slate-100 text-slate-350 cursor-not-allowed' 
                            : isLimitHit
                              ? 'bg-amber-50 text-amber-500 cursor-not-allowed' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-900 group-hover:bg-slate-900 group-hover:text-white cursor-pointer active:scale-95'
                        }`}
                        title="Agregar al carrito"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart pane (4/12 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-24">
          
          {/* Cart Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-display font-semibold text-slate-900">Carrito de Compra</h3>
            </div>
            <span className="font-mono bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} uds.
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-3.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono space-y-3 select-none">
                <ShoppingBag className="w-12 h-12 text-slate-200 stroke-[1.5]" />
                <div className="text-xs">El carrito está vacío.</div>
                <div className="text-[10px] text-slate-400">Haga clic en los productos del catálogo izquierdo para comenzar.</div>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="pt-3.5 flex items-start justify-between gap-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{item.product.emoji}</span>
                      <span className="font-medium text-slate-850 text-xs leading-snug line-clamp-1">{item.product.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ${item.product.price.toFixed(2)} c/u • Sub: ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Counter controllers */}
                  <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                    <button
                      onClick={() => decreaseQuantity(item.product.id)}
                      className="p-1 hover:bg-slate-200 text-slate-600 rounded transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-slate-900 px-1 text-center min-w-[14px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item.product)}
                      disabled={item.quantity >= item.product.stock}
                      className={`p-1 rounded transition-colors ${
                        item.quantity >= item.product.stock 
                          ? 'text-slate-300 cursor-not-allowed' 
                          : 'hover:bg-slate-200 text-slate-600 cursor-pointer'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 hover:bg-red-50 text-slate-350 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Pricing Summary and triggers */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
            
            {/* Discount selector bar */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-500" />
                Descuento
              </span>
              <div className="flex items-center space-x-1.5">
                {[0, 5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                      discountPercent === pct 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-white hover:bg-slate-200 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {pct === 0 ? 'Sin desc.' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="space-y-1.5 text-xs text-slate-650 font-mono">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-red-500 font-medium">
                  <span>Desc. ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-2">
                <span>Total a Cobrar</span>
                <span className="text-base text-slate-950 font-black">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Checkout Trigger */}
            <button
              id="pos-checkout-btn"
              onClick={() => cart.length > 0 && setShowCheckoutModal(true)}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl text-center text-xs md:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
                cart.length > 0 
                  ? 'bg-slate-950 hover:bg-slate-850 text-white cursor-pointer hover:shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Proceder al Pago (${total.toFixed(2)})
            </button>

          </div>

        </div>

      </div>

      {/* CHECKOUT MODAL WINDOW WITH LIVE NUMERIC PAD & TICKET GENERATION */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!saleSuccess ? () => setShowCheckoutModal(false) : undefined}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-lg z-10 relative overflow-hidden"
            >

              {!saleSuccess ? (
                /* SCREEN 1: Select payment method and process */
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-display font-medium text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      Procesar Transacción de Venta
                    </h3>
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Payment method selector tabs */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1">Método de Cancelación</label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Cash */}
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center justify-center p-4.5 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === 'cash' 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-sm' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Banknote className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-medium">Efectivo</span>
                      </button>

                      {/* Card */}
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center justify-center p-4.5 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === 'card' 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-sm' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-medium">Tarjeta POS</span>
                      </button>

                      {/* Digital transfer */}
                      <button
                        onClick={() => setPaymentMethod('transfer')}
                        className={`flex flex-col items-center justify-center p-4.5 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === 'transfer' 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-sm' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Smartphone className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-medium">Transf. QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Cash logic: Numerical Pad */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-150 animate-fadeIn">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-slate-500 font-mono">Total de la Compra:</span>
                        <span className="text-base font-bold text-slate-900 font-mono">${total.toFixed(2)}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Efectivo Recibido ($)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-slate-400">$</span>
                          <input
                            type="text"
                            value={cashReceived}
                            onChange={(e) => {
                              // evaluate valid inputs only
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                setCashReceived(val);
                              }
                            }}
                            placeholder="Ingrese cantidad recibida..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 font-bold font-mono text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                      </div>

                      {/* Quick cash shortcuts */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {CASH_SHORTCUTS.map((sc, scIdx) => (
                          <button
                            key={scIdx}
                            onClick={() => setCashReceived(sc.value.toFixed(2))}
                            className="bg-white hover:bg-slate-100 text-[10px] font-mono font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md cursor-pointer transition-colors"
                          >
                            {sc.label}
                          </button>
                        ))}
                      </div>

                      {/* Automatic cash change display */}
                      {parsedCashReceived >= total ? (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono text-emerald-700 font-bold">
                          <span>Vuelto / Cambio a entregar:</span>
                          <span className="text-lg font-black">${cashChange.toFixed(2)}</span>
                        </div>
                      ) : (
                        parsedCashReceived > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-red-500 font-mono font-bold">
                            <span>Suma faltante por cobrar:</span>
                            <span>${(total - parsedCashReceived).toFixed(2)}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Summary card info */}
                  {paymentMethod !== 'cash' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span>Terminal POS ID:</span>
                        <span className="font-bold">#A-092-A</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Método:</span>
                        <span className="font-bold uppercase text-slate-800">{paymentMethod === 'card' ? 'Autorización Bancaria Electrónica' : 'Transferencia Directa de Cuenta'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                        <span>Importe neto a descontar:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Submission triggers */}
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      Volver al Carrito
                    </button>
                    <button
                      onClick={handleFinalizeSale}
                      disabled={paymentMethod === 'cash' && parsedCashReceived < total}
                      className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-colors ${
                        paymentMethod === 'cash' && parsedCashReceived < total
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 border border-slate-950 text-white hover:bg-black shadow-md'
                      }`}
                    >
                      Confirmar y Emitir Boleta
                    </button>
                  </div>
                </div>
              ) : (
                /* SCREEN 2: Digital Receipt Success ticket display */
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center pb-2 select-none">
                    <CircleCheck className="w-12 h-12 text-emerald-500 animate-[bounce_0.6s_ease-out]" />
                    <h3 className="text-xl font-display font-medium text-slate-900 mt-2">¡Venta Registrada Exitosamente!</h3>
                    <p className="text-slate-400 text-xs font-mono mt-0.5 uppercase">TICKET REAL-TIME DE COMPRA #{saleSuccess.id}</p>
                  </div>

                  {/* Receipt overview details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs font-mono space-y-2 max-h-64 overflow-y-auto">
                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span>Artículos</span>
                      <span>Total</span>
                    </div>

                    <div className="space-y-1">
                      {saleSuccess.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>{it.quantity}x {it.name}</span>
                          <span>${(it.quantity * it.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${saleSuccess.subtotal.toFixed(2)}</span>
                      </div>
                      {saleSuccess.discount > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>Desc.:</span>
                          <span>-${saleSuccess.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 text-sm">
                        <span>Total Cobrado:</span>
                        <span>${saleSuccess.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-250/50 pt-2 text-[10px] text-slate-400">
                      <div>Forma de Pago: <span className="uppercase text-slate-700 font-bold">{saleSuccess.paymentMethod === 'cash' ? 'Efectivo' : saleSuccess.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia QR'}</span></div>
                      {saleSuccess.paymentMethod === 'cash' && saleSuccess.cashReceived !== undefined && (
                        <>
                          <div>Entregado: <span className="text-slate-700">${saleSuccess.cashReceived.toFixed(2)}</span></div>
                          <div>Vuelto Entregado: <span className="text-emerald-600 font-bold">${saleSuccess.changePaid?.toFixed(2)}</span></div>
                        </>
                      )}
                      <div className="mt-1">Cajero: {saleSuccess.cashier}</div>
                      <div>Fecha: {new Date(saleSuccess.timestamp).toLocaleString('es-ES')}</div>
                    </div>
                  </div>

                  {/* Dynamic Alert of stock reduction */}
                  <div className="bg-slate-950 p-3 rounded-xl flex items-center space-x-2 text-left text-white text-[10px] uppercase font-mono tracking-wider select-none">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>El inventario se sincronizó y el stock disponible fue reducido correspondientemente.</span>
                  </div>

                  {/* Finished button */}
                  <div className="pt-2">
                    <button
                      onClick={handleCloseSuccessScreen}
                      className="w-full bg-slate-900 border border-slate-950 hover:bg-black text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md"
                    >
                      Aceptar y Continuar
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
