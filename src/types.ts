export interface KPIMetric {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  detailedData: any;
}

export type ActiveTab = 'summary' | 'availability' | 'reject' | 'delivery';

export interface PlantData {
  id: string;
  name: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  productionHours: number;
  goodParts: number;
  scrapRate: number;
  topKPIs: {
    ePlant: number;
    mfgType: string;
    mfgCell: string;
    productCount: number;
    downtimePercent: number;
    totalDowntimeHours: number;
    availableActualHours: number;
  };
  oeeByMfgType: {
    total: number;
    change: string;
    trend: 'up' | 'down';
    genericTime: number;
    injectionTime: number;
  };
  oeeTrendAnnual: {
    average: number;
    change: string;
    trend: 'up' | 'down';
    bars: {
      label: string;
      value: number;
      type: 'Injective' | 'Generic';
    }[];
  };
  productionDowntimeHours: {
    average: number;
    change: string;
    trend: 'up' | 'down';
    series: {
      time: string;
      production: number;
      downtime: number;
    }[];
  };
  standardActualParts: {
    coefficient: number;
    change: string;
    trend: 'up' | 'down';
    bubbles: {
      x: number;
      y: number;
      size: number;
      type: 'standard' | 'actual';
    }[];
  };
  scrapByMfgType: {
    percent: number;
    change: string;
    trend: 'up' | 'down';
    points: {
      month: string;
      scrap: number;
    }[];
  };
}
