export interface DiscountPoint {
  id: number;
  clause: number;
  percent: number;
  active_days: number;
}

export interface Order {
  id: number;
  user_id: number;
  start_date: Date;
  price: number;
  period: number;
  product_id: number;
  created_at?: Date;
  tarif: string;
}

export interface Product {
  id: number;
  product_type: Product_types;
  in_use: boolean;
  created_at: Date;
  tarif: TarifsDenotations;
}

export type Product_types = 'car';
export type TarifsDenotations = 'base';