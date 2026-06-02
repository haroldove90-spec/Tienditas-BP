/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, Store, Seller, Sale, StockTransfer, StockAdjustment, CashAudit } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'alimentos', name: 'Alimentos y Bebidas', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
  { id: 'tecnologia', name: 'Tecnología', color: 'bg-blue-50 text-blue-800 border-blue-100' },
  { id: 'ropa', name: 'Ropa y Accesorios', color: 'bg-purple-50 text-purple-800 border-purple-100' },
  { id: 'hogar', name: 'Hogar', color: 'bg-amber-50 text-amber-800 border-amber-100' },
  { id: 'papeleria', name: 'Papelería', color: 'bg-rose-50 text-rose-800 border-rose-100' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-papas',
    name: 'Papas Fritas Gourmet XL',
    sku: 'ALM-PAP-010',
    price: 30.00, // Base price ($30)
    category: 'alimentos',
    stock: 500, // Total global warehouse stock
    minStock: 25,
    emoji: '🍟'
  },
  {
    id: 'prod-1',
    name: 'Café Espresso Premium',
    sku: 'CAF-ESP-001',
    price: 3.50,
    category: 'alimentos',
    stock: 260,
    minStock: 15,
    emoji: '☕'
  },
  {
    id: 'prod-2',
    name: 'Croissant de Mantequilla',
    sku: 'PAN-CRO-002',
    price: 2.20,
    category: 'alimentos',
    stock: 175,
    minStock: 12,
    emoji: '🥐'
  },
  {
    id: 'prod-3',
    name: 'Auriculares Inalámbricos',
    sku: 'TEC-AUR-003',
    price: 49.99,
    category: 'tecnologia',
    stock: 47,
    minStock: 5,
    emoji: '🎧'
  },
  {
    id: 'prod-4',
    name: 'Camiseta de Algodón Orgánico',
    sku: 'ROP-CAM-004',
    price: 19.99,
    category: 'ropa',
    stock: 110,
    minStock: 10,
    emoji: '👕'
  },
  {
    id: 'prod-5',
    name: 'Botella de Agua Térmica',
    sku: 'HOG-BOT-005',
    price: 15.00,
    category: 'hogar',
    stock: 81,
    minStock: 15,
    emoji: '🧉'
  },
  {
    id: 'prod-6',
    name: 'Cuaderno Minimalista A5',
    sku: 'PAP-CUA-006',
    price: 6.50,
    category: 'papeleria',
    stock: 110,
    minStock: 10,
    emoji: '📓'
  },
  {
    id: 'prod-7',
    name: 'Cargador Rápido USB-C 20W',
    sku: 'TEC-CAR-007',
    price: 12.99,
    category: 'tecnologia',
    stock: 39,
    minStock: 8,
    emoji: '🔌'
  },
  {
    id: 'prod-8',
    name: 'Lentes de Sol Clásicos',
    sku: 'ROP-LEN-008',
    price: 24.50,
    category: 'ropa',
    stock: 68,
    minStock: 6,
    emoji: '🕶️'
  }
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-a',
    name: 'Tienda Móvil A (Corporativo)',
    location: 'Evento Corporativo Torre Bancomer',
    status: 'active',
    prices: {
      'prod-papas': 40.00, // Expensive list for corporate event
      'prod-1': 5.00,
      'prod-2': 3.50,
      'prod-3': 55.00
    },
    stock: {
      'prod-papas': 120,
      'prod-1': 80,
      'prod-2': 40,
      'prod-3': 10,
      'prod-4': 25,
      'prod-5': 30,
      'prod-6': 25,
      'prod-7': 12,
      'prod-8': 18
    }
  },
  {
    id: 'store-b',
    name: 'Tienda Móvil B (Feria Escolar)',
    location: 'Feria Escolar - Colegio Alemán',
    status: 'active',
    prices: {
      'prod-papas': 25.00, // Affordable list for students
      'prod-1': 2.80,
      'prod-2': 1.80,
      'prod-3': 45.00
    },
    stock: {
      'prod-papas': 150,
      'prod-1': 15, // Low stock since minStock is 15
      'prod-2': 35,
      'prod-3': 5,
      'prod-4': 30,
      'prod-5': 5,  // Low stock alert
      'prod-6': 40,
      'prod-7': 8,
      'prod-8': 20
    }
  },
  {
    id: 'store-c',
    name: 'Tienda Móvil C (Festival Rock)',
    location: 'Festival MusikFest - Foro Sol',
    status: 'active',
    prices: {
      'prod-papas': 45.00, // High pricing for music festivals
      'prod-1': 6.00,
      'prod-2': 4.00,
      'prod-4': 25.00
    },
    stock: {
      'prod-papas': 180,
      'prod-1': 110,
      'prod-2': 80,
      'prod-3': 20,
      'prod-4': 40,
      'prod-5': 3,  // Critical low stock alert
      'prod-6': 15,
      'prod-7': 15,
      'prod-8': 15
    }
  },
  {
    id: 'store-d',
    name: 'Tienda Móvil D (Exposición)',
    location: 'Exposición Bazar Cultural Roma',
    status: 'inactive', // Start inactive so admin can experience activation/deactivation
    prices: {
      'prod-papas': 30.00, // Standard base pricing
      'prod-1': 3.50,
      'prod-2': 2.20
    },
    stock: {
      'prod-papas': 50,
      'prod-1': 10,
      'prod-2': 20,
      'prod-3': 12,
      'prod-4': 15,
      'prod-5': 13,
      'prod-6': 30,
      'prod-7': 4,
      'prod-8': 15
    }
  }
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'sell-1',
    name: 'Carlos Gómez',
    email: 'carlos.ventas@nexuspos.com',
    status: 'active',
    assignedStoreId: 'store-a',
    assignedEvent: 'Catering Privado BBVA'
  },
  {
    id: 'sell-2',
    name: 'Sofía Martínez',
    email: 'sofia.m@nexuspos.com',
    status: 'active',
    assignedStoreId: 'store-b',
    assignedEvent: 'Kermés Escolar Primavera'
  },
  {
    id: 'sell-3',
    name: 'Juan Pérez',
    email: 'juan.p@nexuspos.com',
    status: 'active',
    assignedStoreId: 'store-c',
    assignedEvent: 'Festival Indio Rock'
  },
  {
    id: 'sell-4',
    name: 'Ana Delgado',
    email: 'ana.d@nexuspos.com',
    status: 'active',
    assignedStoreId: 'store-d',
    assignedEvent: 'Exposición Estilo Roma'
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'tr-101',
    timestamp: '2026-06-02T10:30:00Z',
    productId: 'prod-papas',
    fromStoreId: 'store-b',
    toStoreId: 'store-c',
    quantity: 50
  },
  {
    id: 'tr-102',
    timestamp: '2026-06-02T14:15:00Z',
    productId: 'prod-1',
    fromStoreId: 'store-a',
    toStoreId: 'store-b',
    quantity: 20
  }
];

export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-501',
    timestamp: '2026-06-02T09:12:00Z',
    productId: 'prod-2',
    storeId: 'store-b',
    quantity: 4,
    reason: 'merma',
    notes: 'Croissants aplastados durante transporte'
  },
  {
    id: 'adj-502',
    timestamp: '2026-06-02T11:45:00Z',
    productId: 'prod-5',
    storeId: 'store-c',
    quantity: 2,
    reason: 'producto_dañado',
    notes: 'Botellas rayadas en exhibidor'
  }
];

export const INITIAL_AUDITS: CashAudit[] = [
  {
    id: 'aud-201',
    timestamp: '2026-06-01T21:30:00Z',
    storeId: 'store-a',
    cashier: 'Carlos Gómez',
    expectedCash: 350.50,
    reportedCash: 350.50,
    difference: 0,
    reportedCards: 200.00,
    reportedTransfers: 150.00,
    isClosed: true
  },
  {
    id: 'aud-202',
    timestamp: '2026-06-01T22:15:00Z',
    storeId: 'store-b',
    cashier: 'Sofía Martínez',
    expectedCash: 120.00,
    reportedCash: 115.00,
    difference: -5.00, // Discrepancia
    reportedCards: 320.00,
    reportedTransfers: 0,
    isClosed: true
  },
  {
    id: 'aud-203',
    timestamp: '2026-06-02T20:55:00Z', // Today (Ready to audit)
    storeId: 'store-c',
    cashier: 'Juan Pérez',
    expectedCash: 480.00,
    reportedCash: 0,
    difference: -480.00,
    reportedCards: 240.00,
    reportedTransfers: 120.00,
    isClosed: false // Open right now!
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'V-1001',
    timestamp: '2026-06-02T11:15:00Z',
    storeId: 'store-a',
    items: [
      { productId: 'prod-papas', name: 'Papas Fritas Gourmet XL', price: 40.00, quantity: 2 },
      { productId: 'prod-1', name: 'Café Espresso Premium', price: 5.00, quantity: 2 }
    ],
    subtotal: 90.00,
    discount: 0,
    total: 90.00,
    paymentMethod: 'cash',
    cashReceived: 100.00,
    changePaid: 10.00,
    cashier: 'Carlos Gómez'
  },
  {
    id: 'V-1002',
    timestamp: '2026-06-02T13:40:00Z',
    storeId: 'store-b',
    items: [
      { productId: 'prod-papas', name: 'Papas Fritas Gourmet XL', price: 25.00, quantity: 3 },
      { productId: 'prod-2', name: 'Croissant de Mantequilla', price: 1.80, quantity: 2 }
    ],
    subtotal: 78.60,
    discount: 5.00,
    total: 73.60,
    paymentMethod: 'card',
    cashier: 'Sofía Martínez'
  },
  {
    id: 'V-1003',
    timestamp: '2026-06-02T16:20:00Z',
    storeId: 'store-c',
    items: [
      { productId: 'prod-papas', name: 'Papas Fritas Gourmet XL', price: 45.00, quantity: 4 },
      { productId: 'prod-4', name: 'Camiseta de Algodón Orgánico', price: 25.00, quantity: 1 }
    ],
    subtotal: 205.00,
    discount: 0,
    total: 205.00,
    paymentMethod: 'transfer',
    cashier: 'Juan Pérez'
  },
  {
    id: 'V-1004',
    timestamp: '2026-06-02T18:10:00Z',
    storeId: 'store-a',
    items: [
      { productId: 'prod-3', name: 'Auriculares Inalámbricos', price: 55.00, quantity: 1 }
    ],
    subtotal: 55.00,
    discount: 0,
    total: 55.00,
    paymentMethod: 'card',
    cashier: 'Carlos Gómez'
  }
];
