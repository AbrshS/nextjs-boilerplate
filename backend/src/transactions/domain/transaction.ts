export enum TransactionStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  DECLINED = 'DECLINED',
}

export class Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  description?: string | null;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialKPIs {
  grossRevenue: number;
  grossRevenueDelta: number;
  activeSubscriptions: number;
  activeSubscriptionsDelta: number;
  churnRate: number;
  churnRateDelta: number;
  platformCommission: number;
  platformCommissionDelta: number;
  operationalMargin: number;
  operationalMarginDelta: number;
}

export interface CashflowPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}
