export interface OrderDto {
  id: number;
  period: number;
  start_date?: Date;
  user_id?: number;
}

export interface CalcPriceDto {
  id: number;
  period: number;
}