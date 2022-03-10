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
  created_at?: Date;
  tarif: string;
}