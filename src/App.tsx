/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Role, 
  Product, 
  Sale, 
  Category, 
  Store, 
  Seller, 
  StockTransfer, 
  StockAdjustment, 
  CashAudit 
} from './types';
import { 
  INITIAL_SALES, 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_STORES, 
  INITIAL_SELLERS, 
  INITIAL_TRANSFERS, 
  INITIAL_ADJUSTMENTS, 
  INITIAL_AUDITS 
} from './data';
import RoleSelector from './components/RoleSelector';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardVendedor from './components/DashboardVendedor';

export default function App() {
  const [role, setRole] = useState<Role>(null);

  // PWA Prompting and Install managers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsAlreadyInstalled(true);
    }
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAlreadyInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar "Tienditas BP" en dispositivos iOS o navegadores que no lo soportan nativamente, toca el icono de "Compartir" de tu navegador y selecciona "Agregar a pantalla de inicio".');
    }
  };

  // Core application states
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [stores, setStores] = useState<Store[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [audits, setAudits] = useState<CashAudit[]>([]);

  // 1. Initialize all application datasets on mount with localStorage caching.
  useEffect(() => {
    // Products
    const storedProducts = localStorage.getItem('pos_products');
    if (storedProducts) {
      try { setProducts(JSON.parse(storedProducts)); } catch (e) {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('pos_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('pos_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    // Sales
    const storedSales = localStorage.getItem('pos_sales');
    if (storedSales) {
      try { setSales(JSON.parse(storedSales)); } catch (e) {
        setSales(INITIAL_SALES);
        localStorage.setItem('pos_sales', JSON.stringify(INITIAL_SALES));
      }
    } else {
      setSales(INITIAL_SALES);
      localStorage.setItem('pos_sales', JSON.stringify(INITIAL_SALES));
    }

    // Stores
    const storedStores = localStorage.getItem('pos_stores');
    if (storedStores) {
      try { setStores(JSON.parse(storedStores)); } catch (e) {
        setStores(INITIAL_STORES);
        localStorage.setItem('pos_stores', JSON.stringify(INITIAL_STORES));
      }
    } else {
      setStores(INITIAL_STORES);
      localStorage.setItem('pos_stores', JSON.stringify(INITIAL_STORES));
    }

    // Sellers
    const storedSellers = localStorage.getItem('pos_sellers');
    if (storedSellers) {
      try { setSellers(JSON.parse(storedSellers)); } catch (e) {
        setSellers(INITIAL_SELLERS);
        localStorage.setItem('pos_sellers', JSON.stringify(INITIAL_SELLERS));
      }
    } else {
      setSellers(INITIAL_SELLERS);
      localStorage.setItem('pos_sellers', JSON.stringify(INITIAL_SELLERS));
    }

    // Transfers
    const storedTransfers = localStorage.getItem('pos_transfers');
    if (storedTransfers) {
      try { setTransfers(JSON.parse(storedTransfers)); } catch (e) {
        setTransfers(INITIAL_TRANSFERS);
        localStorage.setItem('pos_transfers', JSON.stringify(INITIAL_TRANSFERS));
      }
    } else {
      setTransfers(INITIAL_TRANSFERS);
      localStorage.setItem('pos_transfers', JSON.stringify(INITIAL_TRANSFERS));
    }

    // Adjustments
    const storedAdjustments = localStorage.getItem('pos_adjustments');
    if (storedAdjustments) {
      try { setAdjustments(JSON.parse(storedAdjustments)); } catch (e) {
        setAdjustments(INITIAL_ADJUSTMENTS);
        localStorage.setItem('pos_adjustments', JSON.stringify(INITIAL_ADJUSTMENTS));
      }
    } else {
      setAdjustments(INITIAL_ADJUSTMENTS);
      localStorage.setItem('pos_adjustments', JSON.stringify(INITIAL_ADJUSTMENTS));
    }

    // Audits
    const storedAudits = localStorage.getItem('pos_audits');
    if (storedAudits) {
      try { setAudits(JSON.parse(storedAudits)); } catch (e) {
        setAudits(INITIAL_AUDITS);
        localStorage.setItem('pos_audits', JSON.stringify(INITIAL_AUDITS));
      }
    } else {
      setAudits(INITIAL_AUDITS);
      localStorage.setItem('pos_audits', JSON.stringify(INITIAL_AUDITS));
    }
  }, []);

  // Save actions helper
  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
  };

  const saveSalesToStorage = (updatedSales: Sale[]) => {
    setSales(updatedSales);
    localStorage.setItem('pos_sales', JSON.stringify(updatedSales));
  };

  const saveStoresToStorage = (updatedStores: Store[]) => {
    setStores(updatedStores);
    localStorage.setItem('pos_stores', JSON.stringify(updatedStores));
  };

  const saveSellersToStorage = (updatedSellers: Seller[]) => {
    setSellers(updatedSellers);
    localStorage.setItem('pos_sellers', JSON.stringify(updatedSellers));
  };

  const saveTransfersToStorage = (updatedTransfers: StockTransfer[]) => {
    setTransfers(updatedTransfers);
    localStorage.setItem('pos_transfers', JSON.stringify(updatedTransfers));
  };

  const saveAdjustmentsToStorage = (updatedAdjustments: StockAdjustment[]) => {
    setAdjustments(updatedAdjustments);
    localStorage.setItem('pos_adjustments', JSON.stringify(updatedAdjustments));
  };

  const saveAuditsToStorage = (updatedAudits: CashAudit[]) => {
    setAudits(updatedAudits);
    localStorage.setItem('pos_audits', JSON.stringify(updatedAudits));
  };

  // 2. ADMIN OPERATIONS
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...newProductData, id };
    const updatedProducts = [...products, newProduct];
    saveProductsToStorage(updatedProducts);

    // Give default stock to all existing active stores as well for stability
    const updatedStores = stores.map(store => ({
      ...store,
      stock: {
        ...store.stock,
        [id]: 0 // Start initial customized stock at 0
      }
    }));
    saveStoresToStorage(updatedStores);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    const updated = products.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    );
    saveProductsToStorage(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProductsToStorage(updated);

    // Clean from stores prices/stocks models
    const updatedStores = stores.map(store => {
      const cStock = { ...store.stock };
      const cPrices = { ...store.prices };
      delete cStock[productId];
      delete cPrices[productId];
      return { ...store, stock: cStock, prices: cPrices };
    });
    saveStoresToStorage(updatedStores);
  };

  // 3. SELLER SALES OPERATIONS
  const handleAddSale = (newSaleData: Omit<Sale, 'id'>) => {
    // Generate sale ID
    const newId = `V-${Math.floor(1001 + Math.random() * 8999)}`;
    const finalSale: Sale = {
      ...newSaleData,
      id: newId,
    };

    // Update sales record
    const updatedSales = [finalSale, ...sales];
    saveSalesToStorage(updatedSales);

    // Deduct stock globally
    const updatedProducts = products.map(prod => {
      const soldItem = newSaleData.items.find(it => it.productId === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stock: Math.max(prod.stock - soldItem.quantity, 0)
        };
      }
      return prod;
    });
    saveProductsToStorage(updatedProducts);

    // Deduct stock in specific store units
    const updatedStores = stores.map(store => {
      if (store.id === newSaleData.storeId) {
        const itemStocks = { ...store.stock };
        newSaleData.items.forEach(it => {
          const currentQty = itemStocks[it.productId] || 0;
          itemStocks[it.productId] = Math.max(currentQty - it.quantity, 0);
        });
        return { ...store, stock: itemStocks };
      }
      return store;
    });
    saveStoresToStorage(updatedStores);
  };

  const handleResetToHome = () => {
    setRole(null);
  };

  return (
    <div id="app-viewport" className="min-h-screen bg-[#F9FAFB] selection:bg-indigo-650 selection:text-white antialiased">
      {/* Role Access Portal */}
      {role === null && (
        <RoleSelector 
          onSelectRole={(selectedRole) => setRole(selectedRole)} 
          onInstallApp={handleInstallApp}
          showInstallButton={deferredPrompt !== null || !isAlreadyInstalled}
        />
      )}

      {/* ADMIN INTUITIVE DASHBOARD */}
      {role === 'admin' && (
        <DashboardAdmin
          products={products}
          categories={categories}
          sales={sales}
          stores={stores}
          sellers={sellers}
          transfers={transfers}
          adjustments={adjustments}
          audits={audits}
          onAddProduct={handleAddProduct}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          onUpdateStores={saveStoresToStorage}
          onUpdateSellers={saveSellersToStorage}
          onAddTransfer={(t) => saveTransfersToStorage([t, ...transfers])}
          onAddAdjustment={(adj) => saveAdjustmentsToStorage([adj, ...adjustments])}
          onUpdateAudits={saveAuditsToStorage}
          onUpdateProducts={saveProductsToStorage}
          onResetToHome={handleResetToHome}
          onAddSale={handleAddSale}
          onInstallApp={handleInstallApp}
          showInstallButton={deferredPrompt !== null || !isAlreadyInstalled}
        />
      )}

      {/* VENDEDOR REAL-TIME POINT OF SALE TERMINAL */}
      {role === 'vendedor' && (
        <DashboardVendedor
          products={products}
          categories={categories}
          stores={stores}
          sellers={sellers}
          sales={sales}
          audits={audits}
          onAddSale={handleAddSale}
          onUpdateAudits={saveAuditsToStorage}
          onResetToHome={handleResetToHome}
          onInstallApp={handleInstallApp}
          showInstallButton={deferredPrompt !== null || !isAlreadyInstalled}
        />
      )}
    </div>
  );
}
