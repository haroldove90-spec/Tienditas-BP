/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, Store, Seller, Sale, StockTransfer, StockAdjustment, CashAudit } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'alimentos', name: 'Bebidas y Alimentos', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
  { id: 'importados', name: 'Kirkland / Premium', color: 'bg-blue-50 text-blue-800 border-blue-100' },
  { id: 'energia', name: 'Energía / Suero', color: 'bg-amber-50 text-amber-800 border-amber-100' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'B001', name: 'Jugo Naranja Punch', sku: 'B001', price: 14.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍊' },
  { id: 'B002', name: 'Boing lata', sku: 'B002', price: 17.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B003', name: 'fuze tea 600ml + maleta', sku: 'B003', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🎒' },
  { id: 'B003A', name: 'fuze tea durazno 600ml', sku: 'B003A', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍑' },
  { id: 'B004', name: 'Gatorade Performance 355ml', sku: 'B004', price: 17.00, category: 'energia', stock: 150, minStock: 15, emoji: '⚡' },
  { id: 'B005', name: 'lechitas alpura chocolate /santa clara', sku: 'B005', price: 14.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥛' },
  { id: 'B006A', name: 'Yogurth danone 250g', sku: 'B006A', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍼' },
  { id: 'B006B', name: 'Yogurth danone 120g', sku: 'B006B', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍼' },
  { id: 'B006C', name: 'Yogurth Lala', sku: 'B006C', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍼' },
  { id: 'B007', name: 'Mirinda', sku: 'B007', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B008', name: 'Casera 600ml Refresco', sku: 'B008', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B009', name: 'Squirt 355ml Refresco light', sku: 'B009', price: 14.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B010', name: 'Squirt 400ml', sku: 'B010', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B011', name: '7up Citrus', sku: 'B011', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍋' },
  { id: 'B011A', name: 'Bonafont', sku: 'B011A', price: 10.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B012', name: 'Fresada Peñafiel 600ml', sku: 'B012', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍓' },
  { id: 'B013', name: 'Fresada Peñafiel 600', sku: 'B013', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍓' },
  { id: 'B014', name: 'Limonada Peñafiel 600ml', sku: 'B014', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍋' },
  { id: 'B015', name: 'Mangada Peñafiel 600ml', sku: 'B015', price: 22.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥭' },
  { id: 'B016', name: 'Manzanada Peñafiel 600ml', sku: 'B016', price: 22.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍎' },
  { id: 'B017', name: 'Naranjada Peñafiel 600ml', sku: 'B017', price: 22.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍊' },
  { id: 'B018', name: 'Toronjada Peñafiel 600ml', sku: 'B018', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍊' },
  { id: 'B019', name: 'Piñada Peñafiel 600ml', sku: 'B019', price: 22.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍍' },
  { id: 'B020', name: 'Jarrito surtido lata', sku: 'B020', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B021', name: 'Red cola light 500ml', sku: 'B021', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B022', name: 'Mundet Light 600', sku: 'B022', price: 10.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍎' },
  { id: 'B023', name: 'Deliciosa Manzanita 600ml', sku: 'B023', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍎' },
  { id: 'B023b', name: 'Deliciosa', sku: 'B023b', price: 13.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍎' },
  { id: 'B024', name: 'e-pura', sku: 'B024', price: 9.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B024A', name: 'e-pura 1L', sku: 'B024A', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B025', name: 'Coca Pet 500ml', sku: 'B025', price: 22.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B026', name: 'Coca Lata 355ml', sku: 'B026', price: 25.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B027', name: 'Coca Lata Sin Azucar', sku: 'B027', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B028', name: 'Coca Light 600', sku: 'B028', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B029', name: 'Coca light Lata', sku: 'B029', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B030', name: 'Zubba', sku: 'B030', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B031', name: 'Coca Cola 300ml Sin Azucar', sku: 'B031', price: 11.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B032', name: 'Sidral Mund Light 300ml chubby', sku: 'B032', price: 11.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍎' },
  { id: 'B033', name: 'Sprite Light 300ml chubby', sku: 'B033', price: 11.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B034', name: 'Licuado 240gr', sku: 'B034', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥛' },
  { id: 'B035', name: 'Jarrito Pet 600 ml', sku: 'B035', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B036', name: 'tetrapack boing 250ml', sku: 'B036', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B037', name: 'Suerox (bebida rehidrante)', sku: 'B037', price: 27.00, category: 'energia', stock: 150, minStock: 15, emoji: '⚡' },
  { id: 'B038', name: 'Amper Energizante (473ml)', sku: 'B038', price: 25.00, category: 'energia', stock: 150, minStock: 15, emoji: '🔋' },
  { id: 'B039', name: 'Pepsi Black 355ml', sku: 'B039', price: 14.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B040', name: 'Arizona 460ml', sku: 'B040', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🌵' },
  { id: 'B041', name: 'Jugo del Valle Kids', sku: 'B041', price: 9.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🧃' },
  { id: 'B042', name: 'Agua 500 ml Member\'s Mark', sku: 'B042', price: 7.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B043', name: 'Bonafont 330ml', sku: 'B043', price: 7.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B044', name: 'Coca cola Chubby Original', sku: 'B044', price: 15.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B045', name: 'Coca cola 300ml s/azucar', sku: 'B045', price: 11.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B046', name: 'Pascual Refresco Pet 600ml', sku: 'B046', price: 17.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B047', name: 'Mini Peñafiel sabores 330ml', sku: 'B047', price: 15.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B049', name: 'Pascual agua sabores', sku: 'B049', price: 10.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🧃' },
  { id: 'B050', name: 'Red cola lata', sku: 'B050', price: 16.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B051', name: 'Agua sabor Skarch', sku: 'B051', price: 12.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B052', name: 'Sidral Aga 600ml', sku: 'B052', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🍎' },
  { id: 'B053', name: 'Red cola 600ml', sku: 'B053', price: 18.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B054', name: 'Mineralita 600ml', sku: 'B054', price: 13.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B055', name: 'Jugo Kirkland', sku: 'B055', price: 18.00, category: 'importados', stock: 150, minStock: 15, emoji: '🧃' },
  { id: 'B056', name: 'Té verde Kirkland', sku: 'B056', price: 14.00, category: 'importados', stock: 150, minStock: 15, emoji: '🍵' },
  { id: 'B057', name: 'Bebida deportistas Members Mark', sku: 'B057', price: 20.00, category: 'energia', stock: 150, minStock: 15, emoji: '⚡' },
  { id: 'B058', name: 'Aguafiel Sabores', sku: 'B058', price: 10.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '💧' },
  { id: 'B059', name: 'Pepsi 600ml Pet', sku: 'B059', price: 20.00, category: 'alimentos', stock: 150, minStock: 15, emoji: '🥤' },
  { id: 'B060', name: 'Vive100 lata', sku: 'B060', price: 20.00, category: 'energia', stock: 150, minStock: 15, emoji: '⚡' }
];

// Helper to generate full inventory catalog mapping records programmatically
export const makeDefaultStock = (qty: number): Record<string, number> => {
  const stock: Record<string, number> = {};
  INITIAL_PRODUCTS.forEach(p => {
    stock[p.id] = qty;
  });
  return stock;
};

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-a',
    name: 'Tienda Móvil A (Corporativo)',
    location: 'Evento Corporativo Torre Bancomer',
    status: 'active',
    prices: {
      'B025': 24.00, // Coca Pet override
      'B026': 27.00, // Coca Lata override
      'B001': 16.00  // Jugo Naranja overlay
    },
    stock: makeDefaultStock(120)
  },
  {
    id: 'store-b',
    name: 'Tienda Móvil B (Feria Escolar)',
    location: 'Feria Escolar - Colegio Alemán',
    status: 'active',
    prices: {
      'B024': 10.00, // e-pura price override for school event
      'B042': 8.00
    },
    stock: makeDefaultStock(150)
  },
  {
    id: 'store-c',
    name: 'Tienda Móvil C (Festival Rock)',
    location: 'Festival MusikFest - Foro Sol',
    status: 'active',
    prices: {
      'B025': 26.00, // Concert price hiking
      'B026': 28.00,
      'B038': 30.00
    },
    stock: makeDefaultStock(180)
  },
  {
    id: 'store-d',
    name: 'Tienda Móvil D (Exposición)',
    location: 'Exposición Bazar Cultural Roma',
    status: 'inactive',
    prices: {},
    stock: makeDefaultStock(80)
  }
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'sell-1',
    name: 'Carlos Gómez',
    email: 'carlos.ventas@tienditasbp.com',
    status: 'active',
    assignedStoreId: 'store-a',
    assignedEvent: 'Catering Privado BBVA'
  },
  {
    id: 'sell-2',
    name: 'Sofía Martínez',
    email: 'sofia.m@tienditasbp.com',
    status: 'active',
    assignedStoreId: 'store-b',
    assignedEvent: 'Kermés Escolar Primavera'
  },
  {
    id: 'sell-3',
    name: 'Juan Pérez',
    email: 'juan.p@tienditasbp.com',
    status: 'active',
    assignedStoreId: 'store-c',
    assignedEvent: 'Festival Indio Rock'
  },
  {
    id: 'sell-4',
    name: 'Ana Delgado',
    email: 'ana.d@tienditasbp.com',
    status: 'active',
    assignedStoreId: 'store-d',
    assignedEvent: 'Exposición Estilo Roma'
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'tr-101',
    timestamp: '2026-06-02T10:30:00Z',
    productId: 'B001',
    fromStoreId: 'store-b',
    toStoreId: 'store-c',
    quantity: 15
  },
  {
    id: 'tr-102',
    timestamp: '2026-06-02T14:15:00Z',
    productId: 'B025',
    fromStoreId: 'store-a',
    toStoreId: 'store-b',
    quantity: 20
  }
];

export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-501',
    timestamp: '2026-06-02T09:12:00Z',
    productId: 'B006A',
    storeId: 'store-b',
    quantity: 4,
    reason: 'merma',
    notes: 'Yogures aplastados durante transporte'
  },
  {
    id: 'adj-502',
    timestamp: '2026-06-02T11:45:00Z',
    productId: 'B024',
    storeId: 'store-c',
    quantity: 2,
    reason: 'producto_dañado',
    notes: 'Botellas derramadas en exhibidor'
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
    difference: -5.00,
    reportedCards: 320.00,
    reportedTransfers: 0,
    isClosed: true
  },
  {
    id: 'aud-203',
    timestamp: '2026-06-02T20:55:00Z',
    storeId: 'store-c',
    cashier: 'Juan Pérez',
    expectedCash: 480.00,
    reportedCash: 0,
    difference: -480.00,
    reportedCards: 240.00,
    reportedTransfers: 120.00,
    isClosed: false
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'V-1001',
    timestamp: '2026-06-02T11:15:00Z',
    storeId: 'store-a',
    items: [
      { productId: 'B038', name: 'Amper Energizante (473ml)', price: 25.00, quantity: 2 },
      { productId: 'B025', name: 'Coca Pet 500ml', price: 22.00, quantity: 2 }
    ],
    subtotal: 94.00,
    discount: 0,
    total: 94.00,
    paymentMethod: 'cash',
    cashReceived: 100.00,
    changePaid: 6.00,
    cashier: 'Carlos Gómez'
  },
  {
    id: 'V-1002',
    timestamp: '2026-06-02T13:40:00Z',
    storeId: 'store-b',
    items: [
      { productId: 'B001', name: 'Jugo Naranja Punch', price: 14.00, quantity: 3 },
      { productId: 'B002', name: 'Boing lata', price: 17.00, quantity: 2 }
    ],
    subtotal: 76.00,
    discount: 5.00,
    total: 71.00,
    paymentMethod: 'card',
    cashier: 'Sofía Martínez'
  },
  {
    id: 'V-1003',
    timestamp: '2026-06-02T16:20:00Z',
    storeId: 'store-c',
    items: [
      { productId: 'B057', name: 'Bebida deportistas Members Mark', price: 20.00, quantity: 4 },
      { productId: 'B011', name: '7up Citrus', price: 18.00, quantity: 1 }
    ],
    subtotal: 98.00,
    discount: 0,
    total: 98.00,
    paymentMethod: 'transfer',
    cashier: 'Juan Pérez'
  }
];
