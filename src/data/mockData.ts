import { StoreBranchData, InventoryItem, ClientProfile } from '../types';

export const storeBranchesDataset: Record<string, StoreBranchData> = {
  'branch-1': {
    id: 'branch-1',
    name: 'Vogue Flagship – Oscar Freire (SP)',
    monthlyMetaProgress: 88.5,
    conversionRate: 24.5,
    grossMargin: 62.4,
    customerSatisfaction: 97.8,
    activeSalesHours: 320,
    itemsSold: 12450,
    returnRate: 2.1,
    topKPIs: {
      branchCode: 'FSP-01',
      storeType: 'Vogue Flagship',
      salesManager: 'Beatriz Vasconcelos',
      totalCustomersCount: 3820,
      returnRatePercent: 2.1,
      totalDiscountsGiven: 14500,
      averageTicketValue: 348.5,
    },
    salesByProductType: {
      totalRevenue: 485.2, // R$ mil
      change: '+14.2%/mês',
      trend: 'up',
      apparelSales: 310.4,
      accessorySales: 174.8,
    },
    salesTrendAnnual: {
      averageTicket: 348.5,
      change: '+12.5%/ano',
      trend: 'up',
      bars: [
        { label: 'Outono', value: 310, category: 'Apparel' },
        { label: 'Inverno', value: 385, category: 'Apparel' },
        { label: 'Primavera', value: 298, category: 'Accessories' },
        { label: 'Verão', value: 395, category: 'Accessories' },
      ],
    },
    hourlyTrafficSales: {
      averageTraffic: 145,
      change: '+8%/mês',
      trend: 'up',
      series: [
        { time: '10:00', visitors: 45, transactions: 12 },
        { time: '12:00', visitors: 110, transactions: 28 },
        { time: '14:00', visitors: 90, transactions: 22 },
        { time: '16:00', visitors: 160, transactions: 44 },
        { time: '18:00', visitors: 195, transactions: 58 },
        { time: '20:00', visitors: 115, transactions: 22 },
        { time: '21:00', visitors: 55, transactions: 10 },
      ],
    },
    inventoryTargetActual: {
      complianceCoefficient: 92.4,
      change: '+4.5%/mês',
      trend: 'up',
      bubbles: [
        { x: 15, y: 45, size: 24, type: 'standard', itemName: 'Vestido Estampado' },
        { x: 30, y: 70, size: 26, type: 'standard', itemName: 'Colar de Pérola' },
        { x: 45, y: 60, size: 20, type: 'standard', itemName: 'Bolsa Couro Saffiano' },
        { x: 60, y: 80, size: 30, type: 'standard', itemName: 'Óculos Oversized' },
        { x: 75, y: 75, size: 22, type: 'standard', itemName: 'Jaqueta Bomber' },
        { x: 90, y: 85, size: 28, type: 'standard', itemName: 'Brincos de Argola Ouro' },
        
        { x: 18, y: 43, size: 23, type: 'actual', itemName: 'Vestido Estampado' },
        { x: 33, y: 71, size: 25, type: 'actual', itemName: 'Colar de Pérola' },
        { x: 48, y: 58, size: 19, type: 'actual', itemName: 'Bolsa Couro Saffiano' },
        { x: 63, y: 81, size: 31, type: 'actual', itemName: 'Óculos Oversized' },
        { x: 78, y: 73, size: 21, type: 'actual', itemName: 'Jaqueta Bomber' },
        { x: 93, y: 82, size: 27, type: 'actual', itemName: 'Brincos de Argola Ouro' },
      ],
    },
    returnsByCategory: {
      percent: 2.1,
      change: '-0.35%/mês',
      trend: 'down',
      points: [
        { month: 'Jan', rate: 2.8 },
        { month: 'Fev', rate: 2.5 },
        { month: 'Mar', rate: 2.3 },
        { month: 'Abr', rate: 2.1 },
        { month: 'Mai', rate: 1.9 },
        { month: 'Jun', rate: 2.1 },
      ],
    },
  },
  'branch-2': {
    id: 'branch-2',
    name: 'Boutique Glamour – Ipanema (RJ)',
    monthlyMetaProgress: 94.2,
    conversionRate: 28.1,
    grossMargin: 65.8,
    customerSatisfaction: 98.4,
    activeSalesHours: 280,
    itemsSold: 9840,
    returnRate: 1.8,
    topKPIs: {
      branchCode: 'FRJ-02',
      storeType: 'Boutique Premium',
      salesManager: 'Mariana Alencar',
      totalCustomersCount: 2950,
      returnRatePercent: 1.8,
      totalDiscountsGiven: 11200,
      averageTicketValue: 412.0,
    },
    salesByProductType: {
      totalRevenue: 382.4,
      change: '+18.5%/mês',
      trend: 'up',
      apparelSales: 242.0,
      accessorySales: 140.4,
    },
    salesTrendAnnual: {
      averageTicket: 412.0,
      change: '+8.7%/ano',
      trend: 'up',
      bars: [
        { label: 'Outono', value: 380, category: 'Apparel' },
        { label: 'Inverno', value: 440, category: 'Apparel' },
        { label: 'Primavera', value: 390, category: 'Accessories' },
        { label: 'Verão', value: 460, category: 'Accessories' },
      ],
    },
    hourlyTrafficSales: {
      averageTraffic: 120,
      change: '+12%/mês',
      trend: 'up',
      series: [
        { time: '10:00', visitors: 35, transactions: 11 },
        { time: '12:00', visitors: 95, transactions: 29 },
        { time: '14:00', visitors: 80, transactions: 24 },
        { time: '16:00', visitors: 130, transactions: 38 },
        { time: '18:00', visitors: 180, transactions: 52 },
        { time: '20:00', visitors: 110, transactions: 30 },
        { time: '21:00', visitors: 40, transactions: 12 },
      ],
    },
    inventoryTargetActual: {
      complianceCoefficient: 95.1,
      change: '+2.1%/mês',
      trend: 'up',
      bubbles: [
        { x: 15, y: 55, size: 28, type: 'standard', itemName: 'Fru Fru Bikini' },
        { x: 30, y: 45, size: 18, type: 'standard', itemName: 'Óculos Aviador' },
        { x: 45, y: 75, size: 34, type: 'standard', itemName: 'Bolsa Palha Luxo' },
        { x: 60, y: 35, size: 22, type: 'standard', itemName: 'Sandália Couro' },
        { x: 75, y: 55, size: 26, type: 'standard', itemName: 'Túnica de Seda' },
        { x: 90, y: 65, size: 20, type: 'standard', itemName: 'Bracelete Elegance' },
        
        { x: 18, y: 53, size: 32, type: 'actual', itemName: 'Fru Fru Bikini' },
        { x: 33, y: 40, size: 22, type: 'actual', itemName: 'Óculos Aviador' },
        { x: 48, y: 70, size: 28, type: 'actual', itemName: 'Bolsa Palha Luxo' },
        { x: 63, y: 38, size: 25, type: 'actual', itemName: 'Sandália Couro' },
        { x: 78, y: 50, size: 30, type: 'actual', itemName: 'Túnica de Seda' },
        { x: 93, y: 62, size: 16, type: 'actual', itemName: 'Bracelete Elegance' },
      ],
    },
    returnsByCategory: {
      percent: 1.8,
      change: '-0.12%/mês',
      trend: 'down',
      points: [
        { month: 'Jan', rate: 2.2 },
        { month: 'Fev', rate: 1.9 },
        { month: 'Mar', rate: 1.85 },
        { month: 'Abr', rate: 1.7 },
        { month: 'Mai', rate: 1.6 },
        { month: 'Jun', rate: 1.8 },
      ],
    },
  },
  'branch-3': {
    id: 'branch-3',
    name: 'E-commerce & WhatsApp Sales Hub',
    monthlyMetaProgress: 76.2,
    conversionRate: 4.8,
    grossMargin: 54.1,
    customerSatisfaction: 94.2,
    activeSalesHours: 720,
    itemsSold: 28450,
    returnRate: 4.5,
    topKPIs: {
      branchCode: 'ECH-03',
      storeType: 'Canal Online',
      salesManager: 'Rodrigo Brandão',
      totalCustomersCount: 14500,
      returnRatePercent: 4.5,
      totalDiscountsGiven: 39000,
      averageTicketValue: 215.0,
    },
    salesByProductType: {
      totalRevenue: 611.6,
      change: '+22.4%/mês',
      trend: 'up',
      apparelSales: 420.0,
      accessorySales: 191.6,
    },
    salesTrendAnnual: {
      averageTicket: 215.0,
      change: '+15.2%/ano',
      trend: 'up',
      bars: [
        { label: 'Outono', value: 195, category: 'Apparel' },
        { label: 'Inverno', value: 230, category: 'Apparel' },
        { label: 'Primavera', value: 205, category: 'Accessories' },
        { label: 'Verão', value: 245, category: 'Accessories' },
      ],
    },
    hourlyTrafficSales: {
      averageTraffic: 940,
      change: '+32%/mês',
      trend: 'up',
      series: [
        { time: '10:00', visitors: 420, transactions: 19 },
        { time: '12:00', visitors: 680, transactions: 31 },
        { time: '14:00', visitors: 720, transactions: 32 },
        { time: '16:00', visitors: 890, transactions: 44 },
        { time: '18:00', visitors: 1100, transactions: 55 },
        { time: '20:00', visitors: 1420, transactions: 74 },
        { time: '22:00', visitors: 980, transactions: 42 },
      ],
    },
    inventoryTargetActual: {
      complianceCoefficient: 89.4,
      change: '-1.5%/mês',
      trend: 'down',
      bubbles: [
        { x: 15, y: 35, size: 28, type: 'standard', itemName: 'Blusa Canelada Ribbed' },
        { x: 30, y: 55, size: 18, type: 'standard', itemName: 'Kit Colar Riviera' },
        { x: 45, y: 25, size: 34, type: 'standard', itemName: 'Bolsa Tote Nylon' },
        { x: 60, y: 65, size: 22, type: 'standard', itemName: 'Cinto de Couro Fino' },
        { x: 75, y: 45, size: 26, type: 'standard', itemName: 'T-shirt Algodão Egípcio' },
        { x: 90, y: 30, size: 20, type: 'standard', itemName: 'Brinco Prata Minimal' },
        
        { x: 18, y: 45, size: 32, type: 'actual', itemName: 'Blusa Canelada Ribbed' },
        { x: 33, y: 50, size: 22, type: 'actual', itemName: 'Kit Colar Riviera' },
        { x: 48, y: 35, size: 28, type: 'actual', itemName: 'Bolsa Tote Nylon' },
        { x: 63, y: 70, size: 25, type: 'actual', itemName: 'Cinto de Couro Fino' },
        { x: 78, y: 40, size: 30, type: 'actual', itemName: 'T-shirt Algodão Egípcio' },
        { x: 93, y: 25, size: 16, type: 'actual', itemName: 'Brinco Prata Minimal' },
      ],
    },
    returnsByCategory: {
      percent: 4.5,
      change: '+0.4%/mês',
      trend: 'up',
      points: [
        { month: 'Jan', rate: 3.9 },
        { month: 'Fev', rate: 4.1 },
        { month: 'Mar', rate: 4.5 },
        { month: 'Abr', rate: 4.6 },
        { month: 'Mai', rate: 4.3 },
        { month: 'Jun', rate: 4.5 },
      ],
    },
  },
};

export const initialInventory: InventoryItem[] = [
  // Roupas
  { id: 'PROD-001', name: 'Vestido Midi Seda Floral', category: 'Roupas', sku: 'VMS-10492', price: 389.90, stock: 45, minStock: 10, size: 'M', color: 'Verde Estampado', rating: 4.8 },
  { id: 'PROD-002', name: 'Jaqueta Bomber Couro Ecológico', category: 'Roupas', sku: 'JBC-89301', price: 459.90, stock: 12, minStock: 5, size: 'G', color: 'Preto Clássico', rating: 4.9 },
  { id: 'PROD-004', name: 'Blazer Estruturado Premium', category: 'Roupas', sku: 'BEP-20239', price: 549.00, stock: 24, minStock: 8, size: 'P', color: 'Off-White', rating: 4.7 },
  { id: 'PROD-005', name: 'Calça Alfaiataria High Waist', category: 'Roupas', sku: 'CAH-40112', price: 289.00, stock: 32, minStock: 12, size: 'M', color: 'Nude', rating: 4.6 },
  { id: 'PROD-006', name: 'T-Shirt Algodão Pima Puro', category: 'Roupas', sku: 'TAP-11029', price: 119.90, stock: 8, minStock: 15, size: 'G', color: 'Preto Antracite', rating: 4.5 },
  
  // Acessórios
  { id: 'ACC-001', name: 'Colar Gargantilha Riviera Zircônias', category: 'Acessórios', sku: 'CRZ-00221', price: 259.00, stock: 18, minStock: 5, size: 'Único', color: 'Ródio Branco', rating: 4.9 },
  { id: 'ACC-002', name: 'Brinco Argola Fita Banhado Ouro 18k', category: 'Acessórios', sku: 'BAO-39182', price: 149.90, stock: 55, minStock: 10, size: 'Único', color: 'Dourado Genuíno', rating: 4.8 },
  { id: 'ACC-003', name: 'Óculos Escuros Retro Polarizado', category: 'Acessórios', sku: 'OER-89123', price: 199.00, stock: 4, minStock: 8, size: 'Único', color: 'Tartaruga Marrom', rating: 4.4 },
  
  // Bolsas
  { id: 'BAG-001', name: 'Bolsa Saco Couro Croco Saffiano', category: 'Bolsas', sku: 'BCC-44201', price: 689.90, stock: 14, minStock: 4, size: 'Único', color: 'Marrom Caramelo', rating: 4.9 },
  { id: 'BAG-002', name: 'Clutch Festa Metalizada Strass', category: 'Bolsas', sku: 'CFM-00891', price: 329.00, stock: 11, minStock: 3, size: 'Único', color: 'Prateado Glamour', rating: 4.8 },

  // Calçados
  { id: 'SHO-001', name: 'Sandália Salto Bloco Tiras Couro', category: 'Calçados', sku: 'SST-34029', price: 349.90, stock: 16, minStock: 5, size: 'Único', color: 'Cacau Nude', rating: 4.7 },
  { id: 'SHO-002', name: 'Sapatilha Loafer Minimal Soft', category: 'Calçados', sku: 'SMS-10113', price: 219.00, stock: 3, minStock: 6, size: 'Único', color: 'Preto Matte', rating: 4.5 },
];

export const mockClientProfiles: ClientProfile[] = [
  { id: 'CNT-01', name: 'Camila Albuquerque', email: 'camila.alb@gmail.com', phone: '(11) 98211-3030', preferredCategory: 'Roupas (Vestidos)', totalSpent: 4890.90, membershipLevel: 'Black', points: 489 },
  { id: 'CNT-02', name: 'Alessandra Vasconcellos', email: 'alessandra.v@outlook.com', phone: '(11) 99124-4022', preferredCategory: 'Bolsas & Jóias', totalSpent: 8345.00, membershipLevel: 'Premium', points: 834 },
  { id: 'CNT-03', name: 'Mariana Drummond', email: 'mari_drummond@yahoo.com', phone: '(21) 97812-4411', preferredCategory: 'Acessórios', totalSpent: 2120.00, membershipLevel: 'Gold', points: 212 },
  { id: 'CNT-04', name: 'Juliana Pires', email: 'ju.pires@gmail.com', phone: '(11) 98011-2291', preferredCategory: 'Roupas (Casual / Blazer)', totalSpent: 3450.00, membershipLevel: 'Black', points: 345 },
  { id: 'CNT-05', name: 'Renata Frota', email: 'renata.frota@gmail.com', phone: '(11) 99933-2281', preferredCategory: 'Calçados', totalSpent: 980.00, membershipLevel: 'Estrela', points: 98 },
];

export const returnReasons = [
  { category: 'Tamanho Inadequado (Ficou Largo/Apertado)', count: 184, percentage: 56 },
  { category: 'Divergência de Cor / Expectativa de Tecido', count: 75, percentage: 23 },
  { category: 'Pequena Avaria de Costura ou Botão', count: 39, percentage: 12 },
  { category: 'Desistência / Compra por Impulso', count: 30, percentage: 9 },
];

export const logisticsDeliveryMock = [
  { channel: 'Envio Sedex E-commerce', rating: '99.4%', status: 'Excepcional', scheduleAdherence: 99.8 },
  { channel: 'Entrega Expressa Motoboy (Grande SP)', rating: '97.2%', status: 'Excelente', scheduleAdherence: 98.1 },
  { channel: 'Retirada em Loja (Click & Collect)', rating: '98.5%', status: 'Excelente', scheduleAdherence: 99.2 },
  { channel: 'Transportadora Particular Standard', rating: '89.1%', status: 'Atenção Operacional', scheduleAdherence: 88.4 },
];
