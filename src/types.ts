/**
 * Types modeling a high-end Boutique Fashion & Accessories Commercial Platform.
 * Supports inventory, CRM, active POS triggers, and sales funnels.
 */

export type ActiveTab = 'summary' | 'inventory' | 'returns' | 'delivery';

export interface StoreBranchData {
  id: string;
  name: string;
  monthlyMetaProgress: number; // monthly goal percentage progress (equivalent to circular outer ring)
  conversionRate: number; // percentage of visitors who purchase
  grossMargin: number; // percentage profit margin
  customerSatisfaction: number; // satisfaction score (e.g. 98.4%)
  activeSalesHours: number; // hours of open sales tracked
  itemsSold: number; // count of items sold
  returnRate: number; // percentage of items returned/exchanged
  topKPIs: {
    branchCode: string;
    storeType: string; // "Premium Boutique", "Flagship", "Online Hub"
    salesManager: string;
    totalCustomersCount: number;
    returnRatePercent: number;
    totalDiscountsGiven: number;
    averageTicketValue: number; // average R$ per transaction
  };
  salesByProductType: {
    totalRevenue: number; // In R$ thousands
    change: string; // e.g. "+8.5%/mês"
    trend: 'up' | 'down';
    apparelSales: number; // R$ in clothes
    accessorySales: number; // R$ in accessories (jewelry, bags, sunglasses)
  };
  salesTrendAnnual: {
    averageTicket: number;
    change: string;
    trend: 'up' | 'down';
    bars: {
      label: string; // e.g., "Outuno", "Inverno", "Verão"
      value: number; // ticket value
      category: 'Apparel' | 'Accessories';
    }[];
  };
  hourlyTrafficSales: {
    averageTraffic: number;
    change: string;
    trend: 'up' | 'down';
    series: {
      time: string; // "10:00", "12:00", etc.
      visitors: number; // count of store visitors
      transactions: number; // count of finalized purchases
    }[];
  };
  inventoryTargetActual: {
    complianceCoefficient: number; // percentage of stock fully aligned with seasonal demand
    change: string;
    trend: 'up' | 'down';
    bubbles: {
      x: number;
      y: number;
      size: number;
      type: 'standard' | 'actual'; // target visual items vs actual items
      itemName?: string;
    }[];
  };
  returnsByCategory: {
    percent: number;
    change: string;
    trend: 'up' | 'down';
    points: {
      month: string;
      rate: number;
    }[];
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Roupas' | 'Acessórios' | 'Bolsas' | 'Calçados';
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  size: 'P' | 'M' | 'G' | 'GG' | 'Único';
  color: string;
  rating: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredCategory: string;
  totalSpent: number;
  membershipLevel: 'Estrela' | 'Gold' | 'Black' | 'Premium';
  points: number;
}
