// Client-safe shared types (no server-only imports). The DB layer returns
// objects with this shape, so server pages can pass them straight to the
// customer/admin client components.

export type Product = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: number; // 0 | 1
  sort_order: number;
};

export type PublicSettings = {
  truck_label: string;
  address: string;
  truck_lat: string;
  truck_lng: string;
  maps_url: string;
  whatsapp_number: string;
  truck_status: string;
  hours: string;
};

export type CartItem = { id: number; name: string; price: number; qty: number };

export type CustomerUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
};

export const CATEGORY_ORDER = [
  "The Signature Daigs",
  'The "Safar" Combos',
  "Humsafar (Sides)",
  "Meetha Safar",
  "Beverages",
];
