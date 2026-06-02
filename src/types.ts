/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // Base price
  category: string;
  stock: number; // General stock (or sum across stores)
  minStock: number;
  emoji: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  prices: Record<string, number>; // Maps productId -> customized price override
  stock: Record<string, number>;  // Maps productId -> inventory in this store unit
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  assignedStoreId: string; // The mobile store they are assigned to
  assignedEvent: string;   // Active event name they are working at
}

export interface SaleItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  storeId: string; // Dynamic mobile store unit where sale was made
  items: {
    productId: string;
    name: string;
    price: number; // The sale price customized for that store unit
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  cashReceived?: number;
  changePaid?: number;
  cashier: string;
}

export type Role = 'admin' | 'vendedor' | null;

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface StockTransfer {
  id: string;
  timestamp: string;
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
}

export interface StockAdjustment {
  id: string;
  timestamp: string;
  productId: string;
  storeId: string;
  quantity: number;
  reason: 'merma' | 'producto_dañado' | 'devolución';
  notes: string;
}

export interface CashAudit {
  id: string;
  timestamp: string;
  storeId: string;
  cashier: string;
  expectedCash: number;
  reportedCash: number;
  difference: number;
  reportedCards: number;
  reportedTransfers: number;
  isClosed: boolean;
}
