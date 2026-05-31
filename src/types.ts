export type UserRole = 'user' | 'editor';
export type CollectieId = 'artemis' | 'poseidon' | 'dionysos' | 'zeus';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Parfum {
  id: string;
  nume_parfum: string;
  brand: string;
  creator?: string;
  tip_parfum?: string;
  note_varf?: string;
  note_baza?: string;
  pret: number;
  stoc: number;
  anul_lansarii?: number;
  image_url?: string;
  created_by?: string;
  created_at?: string;
  colectie?: CollectieId;
}

export interface CartItem {
  id: string;
  user_id: string;
  parfum_id: string;
  quantity: number;
  added_at: string;
  parfum?: Parfum;
}

export interface OrderItem {
  id: string;
  order_id: string;
  parfum_id: string;
  parfum_name: string;
  unit_price: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_phone: string;
  stripe_id?: string;
  created_at: string;
  items?: OrderItem[];
}
