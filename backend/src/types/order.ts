type TPaymentType = 'online' | 'card';

export interface IOrder {
  items: string[];
  total: number;
  payment: TPaymentType;
  email: string;
  phone: string;
  address: string;
}
