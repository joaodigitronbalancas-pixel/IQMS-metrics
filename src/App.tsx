import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, User, ShieldAlert, Cpu, CheckCircle2, Sliders, RefreshCw, X, FileSpreadsheet, ChevronDown, Sparkles, ShoppingBag, Heart, HelpCircle, Package, Plus, Search } from 'lucide-react';
import { storeBranchesDataset, initialInventory, mockClientProfiles } from './data/mockData';
import { ActiveTab, StoreBranchData, InventoryItem, ClientProfile } from './types';

// Subcomponents imports
import Sidebar from './components/Sidebar';
import BrowserChrome from './components/BrowserChrome';
import CircularGauge from './components/CircularGauge';
import KPICards from './components/KPICards';
import {
  OoeByMfgTypeWidget,
  OoeTrendAnnualWidget,
  ProductionDowntimeWidget,
  StandardActualPartsWidget,
  ScrapByMfgTypeWidget
} from './components/MetricWidgets';
import {
  InventoryAnalysisView,
  ReturnsAnalysisView,
  DeliveryAnalysisView
} from './components/AnalysisTabs';
import {
  SystemNotificationsDrawer,
  FactoryChatsDrawer
} from './components/UtilityDrawers';
import PDVTerminal from './components/PDVTerminal';
import { IaVendasView } from './components/IaVendasView';

export default function App() {
  // 1. DATA STORES STATES
  const [branchesData, setBranchesData] = useState<Record<string, StoreBranchData>>(storeBranchesDataset);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [clients, setClients] = useState<ClientProfile[]>(mockClientProfiles);

  // 2. UI NAVIGATION STATES
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-1');
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

  // 3. OVERLAYS, DRAWERS, AND DIALOGS
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Interactive reloaders
  const [isReloading, setIsReloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  
  // Custom dialogs inputs (New styling category manual insert)
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Roupas' | 'Acessórios' | 'Bolsas' | 'Calçados'>('Roupas');
  const [newProdPrice, setNewProdPrice] = useState('249.90');
  const [newProdStock, setNewProdStock] = useState('25');

  // Realtime notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Resolving helper references
  const activeBranch = branchesData[selectedBranchId] || branchesData['branch-1'];

  // Manual Trigger: Sincronizar Estoques e Pedidos ERP
  const triggerReload = () => {
    setIsReloading(true);
    setToastMessage("🔄 Sincronizando faturamento, estoque RFID e canais de WhatsApp...");
    setTimeout(() => {
      setIsReloading(false);
      setToastMessage("✅ Todos os estoques físicos e canais integrados foram sincronizados com sucesso!");
    }, 1200);
  };

  // IA Vendas simulation callback to sync parent state/inventories when order gets webhook approved
  const onIaVendasCallback = () => {
    triggerReload();
    // Re-verify the stock of Roupas and Accessories
    setTimeout(() => {
      setInventory(prevInventory => 
        prevInventory.map(item => {
          // If Vestido is sold out we keep a robust state
          if (item.id === 'PROD-001' && item.stock > 3) {
            return { ...item, stock: item.stock - 1 };
          }
          return item;
        })
      );
    }, 200);
  };

  // SUCCESS POS SALES CALLBACK: Wire up stock decrement, revenue addition, and CRM points!
  const handleFinalizedSale = (summary: {
    productId: string;
    quantity: number;
    clientId: string;
    discountPct: number;
    finalPrice: number;
    message: string;
    items?: { product: InventoryItem; qty: number; discount: number; finalPrice: number }[];
    change?: number;
    totalAmount?: number;
  }) => {
    // If it's a multi-item purchase from our high-fidelity POS:
    if (summary.items && summary.items.length > 0) {
      // A. Decrement product stock inside inventory recursively for each cart item
      setInventory(prevInventory => 
        prevInventory.map(item => {
          const cartMatch = summary.items?.find(ci => ci.product.id === item.id);
          if (cartMatch) {
            const newStock = Math.max(0, item.stock - cartMatch.qty);
            return { ...item, stock: newStock };
          }
          return item;
        })
      );

      // B. Calculate CRM loyalty point additions inside clients database on cumulative value
      setClients(prevClients => 
        prevClients.map(c => {
          if (c.id === summary.clientId) {
            const pointsEarned = Math.round((summary.totalAmount || summary.finalPrice) / 10);
            return {
              ...c,
              totalSpent: c.totalSpent + (summary.totalAmount || summary.finalPrice),
              points: c.points + pointsEarned
            };
          }
          return c;
        })
      );

      // C. Update active branch statistics in branches collection
      setBranchesData(prevBranches => {
        const branch = prevBranches[selectedBranchId];
        if (!branch) return prevBranches;

        const totalAddedRevenue = (summary.totalAmount || summary.finalPrice) / 1000;
        const updatedRevenue = branch.salesByProductType.totalRevenue + totalAddedRevenue;

        let clothesAdd = 0;
        let accAdd = 0;
        let totalItemsSold = 0;

        summary.items?.forEach(ci => {
          totalItemsSold += ci.qty;
          if (ci.product.category === 'Roupas') {
            clothesAdd += ci.finalPrice / 1000;
          } else {
            accAdd += ci.finalPrice / 1000;
          }
        });

        const addedProgress = Math.min(100, branch.monthlyMetaProgress + (totalAddedRevenue / 8) * 100);
        const updatedPartsCount = branch.itemsSold + totalItemsSold;

        const totalDiscountsInSale = summary.items?.reduce((sum, ci) => {
          const orig = ci.product.price * ci.qty;
          return sum + (orig - ci.finalPrice);
        }, 0) || 0;

        return {
          ...prevBranches,
          [selectedBranchId]: {
            ...branch,
            monthlyMetaProgress: parseFloat(addedProgress.toFixed(1)),
            itemsSold: updatedPartsCount,
            topKPIs: {
              ...branch.topKPIs,
              totalCustomersCount: branch.topKPIs.totalCustomersCount + 1,
              totalDiscountsGiven: branch.topKPIs.totalDiscountsGiven + totalDiscountsInSale
            },
            salesByProductType: {
              ...branch.salesByProductType,
              totalRevenue: parseFloat(updatedRevenue.toFixed(1)),
              apparelSales: parseFloat((branch.salesByProductType.apparelSales + clothesAdd).toFixed(1)),
              accessorySales: parseFloat((branch.salesByProductType.accessorySales + accAdd).toFixed(1)),
            }
          }
        };
      });

      setToastMessage(`🚀 Venda de ${summary.items.length} itens registrada com sucesso no PDV!`);
    } else {
      // A. Decrement product stock inside inventory (original flow fallback)
      setInventory(prevInventory => 
        prevInventory.map(item => {
          if (item.id === summary.productId) {
            // Calculate new stock safely (minimum 0)
            const newStock = Math.max(0, item.stock - summary.quantity);
            return { ...item, stock: newStock };
          }
          return item;
        })
      );

      // B. Calculate CRM loyalty point additions inside clients database
      setClients(prevClients => 
        prevClients.map(c => {
          if (c.id === summary.clientId) {
            const pointsEarned = Math.round(summary.finalPrice / 10);
            return {
              ...c,
              totalSpent: c.totalSpent + summary.finalPrice,
              points: c.points + pointsEarned
            };
          }
          return c;
        })
      );

      // C. Update active branch statistics in branches collection
      setBranchesData(prevBranches => {
        const branch = prevBranches[selectedBranchId];
        if (!branch) return prevBranches;

        const updatedRevenue = branch.salesByProductType.totalRevenue + (summary.finalPrice / 1000);
        const isClothes = inventory.find(p => p.id === summary.productId)?.category === 'Roupas';

        // Distribute sales proportionally to categories
        const clothesAdd = isClothes ? (summary.finalPrice / 1000) : 0;
        const accAdd = !isClothes ? (summary.finalPrice / 1000) : 0;

        // Adjust Monthly goals percent representation (increases linearly up to 100%)
        const addedProgress = Math.min(100, branch.monthlyMetaProgress + (summary.finalPrice / 8000) * 100);

        // Increment pieces count
        const updatedPartsCount = branch.itemsSold + summary.quantity;

        return {
          ...prevBranches,
          [selectedBranchId]: {
            ...branch,
            monthlyMetaProgress: parseFloat(addedProgress.toFixed(1)),
            itemsSold: updatedPartsCount,
            topKPIs: {
              ...branch.topKPIs,
              totalCustomersCount: branch.topKPIs.totalCustomersCount + 1,
              totalDiscountsGiven: branch.topKPIs.totalDiscountsGiven + ((summary.finalPrice / (1 - summary.discountPct / 100)) * (summary.discountPct / 100) || 0)
            },
            salesByProductType: {
              ...branch.salesByProductType,
              totalRevenue: parseFloat(updatedRevenue.toFixed(1)),
              apparelSales: parseFloat((branch.salesByProductType.apparelSales + clothesAdd).toFixed(1)),
              accessorySales: parseFloat((branch.salesByProductType.accessorySales + accAdd).toFixed(1)),
            }
          }
        };
      });

      // D. Display feedback message toast
      setToastMessage(summary.message);
    }
  };

  // Add stock quantity manually
  const handleAddStock = (productId: string, qty: number) => {
    setInventory(prev => 
      prev.map(p => {
        if (p.id === productId) {
          const updatedStock = p.stock + qty;
          setToastMessage(`📦 Lote de Reposição Registrado! +${qty} unidades adicionadas para o item "${p.name}".`);
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );
  };

  // Form submit: create completely new product style
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const randomSkuSuffix = Math.floor(Math.random() * 90000) + 10000;
    const shortPrefix = newProdCategory === 'Roupas' ? 'V' : newProdCategory === 'Acessórios' ? 'A' : newProdCategory === 'Bolsas' ? 'B' : 'S';
    
    const newProduct: InventoryItem = {
      id: `PROD-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      sku: `${shortPrefix}MS-${randomSkuSuffix}`,
      price: parseFloat(newProdPrice) || 199.90,
      stock: parseInt(newProdStock, 10) || 12,
      minStock: 6,
      size: 'M',
      color: 'Coleção Lançamento',
      rating: 4.8
    };

    setInventory(prev => [newProduct, ...prev]);
    setIsProductManagerOpen(false);
    setToastMessage(`✨ Novo item criado no Portfólio! "${newProdName}" catalogado via RFID.`);
    
    // reset form inputs
    setNewProdName('');
  };

  // Automate closure of alerts toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white overflow-x-hidden font-sans select-none antialiased">
      
      {/* 1. HIGH-END BOUTIQUE VISUAL BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&fit=crop&q=80"
          alt="Luxury High End Clothing Boutique Interiors"
          className="w-full h-full object-cover scale-[1.01] brightness-[0.25] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/85" />
        <div className="absolute inset-0 bg-radial-to-r from-transparent via-black/25 to-[#0a0a0c]/50" />
      </div>

      {/* 2. CHROME BROWSER BAR (TOP FLUID CENTERING) */}
      <header className="relative z-30 pt-3 px-4 w-full">
        <BrowserChrome
          currentUrl="boutique.vogueanalytics.com/omnihub"
          onRefresh={triggerReload}
          isReloading={isReloading}
        />
      </header>

      {/* 3. SIDE NAVIGATION CONTROLS BAR */}
      <Sidebar
        activeScreen={activeTab === 'ia_vendas' ? 'ia-vendas' : 'dashboard'}
        setActiveScreen={(scr) => {
          if (scr === 'dashboard') setActiveTab('summary');
        }}
        onSearchClick={() => setShowSearchBox(true)}
        onNotificationsClick={() => setIsAlertsOpen(true)}
        onMessagesClick={() => setIsChatsOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onIaVendasClick={() => setActiveTab('ia_vendas')}
        unreadCount={3}
      />

      {/* Main Flow Content Dashboard container */}
      <main className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 lg:pl-24 pb-16 pt-3">
        {/* GLASSMORPHISM ACTIVE DASHBOARD FRAME */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full glass-panel rounded-[32px] p-6 sm:p-7 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-white/10 relative"
        >
          {/* Glowing backlights behind glassmorphic cards */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* TOP CONTROLS SECTION: TITLE, PLANT FILTERS, SUB-TABS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/8 pb-6 mb-6">
            
            {/* Header info / Logo */}
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8.5 h-8.5 rounded-xl bg-linear-to-br from-amber-500 to-rose-450 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <ShoppingBag className="w-4.5 h-4.5 text-black font-black animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-display font-bold text-white text-[15px] tracking-wide uppercase">Vogue & Gems</span>
                    <span className="text-[8px] px-1.5 py-0.2 bg-amber-400/15 text-amber-400 font-mono rounded border border-amber-500/20 tracking-normal font-bold uppercase">Omni ERP</span>
                  </div>
                  <span className="text-[9.5px] text-zinc-400 font-mono uppercase tracking-tight">Sistema Comercial Unificado</span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight leading-none">
                  {activeTab === 'summary' && 'Painel de Vendas & BI'}
                  {activeTab === 'inventory' && 'Catálogo & Estoques RFID'}
                  {activeTab === 'returns' && 'Auditoria de Trocas & CRM'}
                  {activeTab === 'delivery' && 'Status de Rastreios & Envios'}
                  {activeTab === 'ia_vendas' && '🧠 Operações Inteligentes Sofia IA'}
                </h1>
                <p className="text-xs text-zinc-400 font-sans mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Conexão ativa de vendas • Filiais integradas
                </p>
              </div>
            </div>

            {/* TAB SELECTORS AND FILTER SELECTION CONTROL BUTTONS */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Select Active Perspective Tab */}
              <div className="flex bg-black/25 p-1 rounded-2xl border border-white/5 overflow-x-auto select-none no-scrollbar">
                {(['summary', 'inventory', 'returns', 'delivery', 'ia_vendas'] as const).map((tab) => {
                  const labels: Record<ActiveTab, string> = {
                    summary: 'Visão Geral (BI)',
                    inventory: 'Ver Estoques RFID',
                    returns: 'Controle de Trocas',
                    delivery: 'Monitor de Fretes',
                    ia_vendas: '🧠 IA Vendas Online',
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 text-xs font-sans font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-linear-to-r from-amber-500 to-rose-450 text-black shadow-md font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Branch/Store locations dropdown selector */}
              <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 hover:bg-[#131317] rounded-2xl transition-all cursor-pointer">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="bg-transparent text-xs text-white font-medium focus:outline-hidden pr-4 cursor-pointer font-sans appearance-none"
                  >
                    <option value="branch-1" className="bg-zinc-950 text-white">SP – Oscar Freire [Flagship]</option>
                    <option value="branch-2" className="bg-zinc-950 text-white">RJ – Ipanema Beach Boutique</option>
                    <option value="branch-3" className="bg-zinc-950 text-white">Omnichannel E-commerce Hub</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none group-hover:text-white" />
                </div>
              </div>

              {/* Launcher/Operator control profile */}
              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="w-8 h-8 rounded-full border border-white/12 overflow-hidden cursor-pointer relative group shrink-0"
              >
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80"
                  alt="Store Supervisor Avatar"
                  className="w-full h-full object-cover grayscale-20"
                />
                <div className="absolute inset-0 bg-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

            </div>
          </div>

          {/* DYNAMIC INFORMATION CORE AREA */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedBranchId}`}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Interactive Store Gauge Dial */}
                  <div className="lg:col-span-3 flex flex-col items-center">
                    <CircularGauge
                      percentage={activeBranch.monthlyMetaProgress}
                      label="Meta Geral Mensal"
                      averageTicket={activeBranch.topKPIs.averageTicketValue}
                      conversionRate={activeBranch.conversionRate}
                      grossMargin={activeBranch.grossMargin}
                      activeHours={activeBranch.activeSalesHours}
                      partsSold={activeBranch.itemsSold}
                      returnRate={activeBranch.returnRate}
                    />
                    
                    {/* Floating Cash Register shortcut trigger */}
                    <button
                      onClick={() => setIsNewSaleOpen(true)}
                      className="w-full py-3 mt-6 bg-linear-to-r from-amber-500 to-rose-500 text-black font-bold text-xs rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4 text-black" />
                      Lançar Venda no Caixa (PDV)
                    </button>
                    <span className="text-[9px] font-mono text-zinc-500 tracking-wider text-center block mt-2 uppercase select-none">Simule compras para atualizar o BI</span>
                  </div>

                  {/* Right Column: 7 KPI Metrics + Charts Grid */}
                  <div className="lg:col-span-9 space-y-6">
                    
                    {/* Modular row mapping retail indicators */}
                    <KPICards
                      branchCode={activeBranch.topKPIs.branchCode}
                      storeType={activeBranch.topKPIs.storeType}
                      salesManager={activeBranch.topKPIs.salesManager}
                      totalCustomersCount={activeBranch.topKPIs.totalCustomersCount}
                      returnRatePercent={activeBranch.topKPIs.returnRatePercent}
                      totalDiscountsGiven={activeBranch.topKPIs.totalDiscountsGiven}
                      averageTicketValue={activeBranch.topKPIs.averageTicketValue}
                    />

                    {/* Proportional Segment progress card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <OoeByMfgTypeWidget data={activeBranch.salesByProductType} />
                      <OoeTrendAnnualWidget data={activeBranch.salesTrendAnnual} />
                    </div>

                    {/* Curves, bubbles standard graphics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <ProductionDowntimeWidget data={activeBranch.hourlyTrafficSales} />
                      <StandardActualPartsWidget data={activeBranch.inventoryTargetActual} />
                      <ScrapByMfgTypeWidget data={activeBranch.returnsByCategory} />
                    </div>

                  </div>

                </div>
              )}

              {/* INVENTORY ANALYSIS VIEW CONTROLLER */}
              {activeTab === 'inventory' && (
                <InventoryAnalysisView
                  inventory={inventory}
                  onAddStock={handleAddStock}
                  onOpenNewProductModal={() => setIsProductManagerOpen(true)}
                />
              )}

              {/* RETURNS ANALYSIS & DEFECTS SCREEN */}
              {activeTab === 'returns' && (
                <ReturnsAnalysisView />
              )}

              {/* DELIVERY MONITOR SCREEN */}
              {activeTab === 'delivery' && (
                <DeliveryAnalysisView />
              )}

              {/* IA VENDAS ONLINE ADVANCED AUTOMATION SCREEN */}
              {activeTab === 'ia_vendas' && (
                <IaVendasView 
                  inventory={inventory}
                  setToastMessage={setToastMessage}
                  triggerReload={onIaVendasCallback}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* BOTTOM PAGINATION FOOTER SLIDERS */}
          <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-white/5 pt-5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="w-8 h-1 rounded-full bg-amber-400 shadow-[0_0_5px_#f59e0b]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>

        </motion.div>
      </main>

      {/* 4. DIALOGS, DRAWER CHATS, AND MODALS STATIONS */}
      
      {/* Dynamic POS checkout simulator modal */}
      <PDVTerminal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        inventory={inventory}
        clients={clients}
        activeBranchName={activeBranch.topKPIs.branchCode + " - " + activeBranch.topKPIs.salesManager}
        onSuccess={handleFinalizedSale}
      />

      {/* Store Operations alarm feed drawer */}
      <SystemNotificationsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      {/* Boutique CRM concierge message drawer */}
      <FactoryChatsDrawer
        isOpen={isChatsOpen}
        onClose={() => setIsChatsOpen(false)}
      />

      {/* Manual product design entry form */}
      <AnimatePresence>
        {isProductManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductManagerOpen(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 z-10 text-white"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Criar Novo Produto de Lançamento</h3>
                <button onClick={() => setIsProductManagerOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vestido Linen Minimalist"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Categoria</label>
                    <select
                      value={newProdCategory}
                      onChange={(e: any) => setNewProdCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-2 py-2 focus:outline-none"
                    >
                      <option value="Roupas">Roupas</option>
                      <option value="Acessórios">Acessórios</option>
                      <option value="Bolsas">Bolsas</option>
                      <option value="Calçados">Calçados</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Tamanho Padrão</label>
                    <select className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-2 py-2 focus:outline-none" disabled>
                      <option value="M">Tamanho M</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Preço Inicial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Lote Inicial (Unidades)</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-linear-to-r from-amber-500 to-rose-400 text-black font-bold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  Registrar e Gerar Código de Barras RFID
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Settings dialog panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 z-10 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white font-display uppercase tracking-wider">Ajustes Comerciais</h3>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-3">
                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Alertas de CRM por WhatsApp</div>
                    <div className="text-[10px] text-zinc-500">Notificar clientes sobre novas peças</div>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-amber-400 p-0.5 flex justify-end cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-zinc-950" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Leitura RFID Integrada</div>
                    <div className="text-[10px] text-zinc-500">Auditoria automática de cabides</div>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-zinc-600 p-0.5 flex justify-start cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-white/70" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="font-semibold text-white mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    Predição de Vendas por IA Geral
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal mb-2.5">
                    Utiliza inteligência artificial avançada para analisar tendências anteriores e sugerir o volume de compra das próximas coleções sazonais.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setToastMessage("🔮 IA analisando tendências e compras CRM preditivas baseadas na coleção Winter Aura...");
                    }}
                    className="w-full py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-indigo-600 font-bold hover:brightness-110 active:scale-98 transition-all cursor-pointer text-white"
                  >
                    Gerar Previsão Sazonal de Compras (IA)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Search overlay wrapper */}
      <AnimatePresence>
        {showSearchBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearchBox(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl glass-panel p-5 rounded-2xl border border-white/10 z-10 space-y-4 text-white"
            >
              <div className="flex items-center gap-3 bg-black/25 px-3 py-2.5 rounded-xl border border-white/5">
                <input
                  type="text"
                  placeholder="Pesquise por produtos ou clientes VIP no CRM..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white text-xs focus:outline-hidden"
                  autoFocus
                />
                <button onClick={() => setShowSearchBox(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {searchQuery ? (
                <div className="text-[11px] text-zinc-300 font-sans space-y-2">
                  <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase border-b border-white/5 pb-1">Resultados da Busca (Filtro Dinâmico)</div>
                  
                  {/* Results for Products */}
                  {inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                    <div 
                      key={`prod-${idx}`}
                      onClick={() => {
                        setToastMessage(`🔍 Exibindo produto no catálogo: ${item.name} (SKU: ${item.sku})`);
                        setActiveTab('inventory');
                        setShowSearchBox(false);
                      }}
                      className="p-2 rounded-lg hover:bg-white/5 hover:text-amber-400 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.sku} • R$ {item.price.toFixed(2)}</span>
                    </div>
                  ))}

                  {/* Results for Clients */}
                  {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                    <div 
                      key={`client-${idx}`}
                      onClick={() => {
                        setToastMessage(`👤 Visualizando perfil de cliente VIP: ${item.name} - ${item.membershipLevel}`);
                        setShowSearchBox(false);
                      }}
                      className="p-2 rounded-lg hover:bg-white/5 hover:text-amber-400 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">CRM • Nível: {item.membershipLevel}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Dica: Busque por "vestido", "colar", "Camila" ou "Alessandra" para resultados instantâneos...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. TOAST BANNER (TOP-RIGHT INDUSTRIAL FLOATER STICKY ALERTS) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 p-4 rounded-2xl glass-panel border border-amber-500/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] max-w-sm flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/15 text-amber-400 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11.5px] font-sans leading-relaxed text-zinc-200 pr-4">
              {toastMessage}
            </div>
            <button onClick={() => setToastMessage(null)} className="p-0.5 rounded text-zinc-500 hover:text-white absolute right-2.5 top-2.5 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
