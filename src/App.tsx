/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, User, ShieldAlert, Cpu, CheckCircle2, Sliders, RefreshCw, X, FileSpreadsheet, ChevronDown, Sparkles } from 'lucide-react';
import { plantsDataset } from './data/mockData';
import { ActiveTab } from './types';

// Subcomponents import
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
  AvailabilityAnalysisView,
  RejectAnalysisView,
  DeliveryAnalysisView
} from './components/AnalysisTabs';
import {
  ReportDowntimeModal,
  SystemNotificationsDrawer,
  FactoryChatsDrawer
} from './components/UtilityDrawers';

export default function App() {
  // State management
  const [selectedPlantId, setSelectedPlantId] = useState<string>('plant-2');
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  
  // Interactive overlays and utility drawers
  const [isDowntimeModalOpen, setIsDowntimeModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isChatsDrawerOpen, setIsChatsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  
  // Realtime notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active dataset
  const activePlant = plantsDataset[selectedPlantId] || plantsDataset['plant-2'];

  const triggerReload = () => {
    setIsReloading(true);
    setToastMessage("Sincronizando com coletores de dados e CLP Scada...");
    setTimeout(() => {
      setIsReloading(false);
      setToastMessage("Logs de telemetria e OEE atualizados com sucesso!");
    }, 1500);
  };

  const handleLoggedEvent = (msg: string) => {
    setToastMessage(msg);
  };

  // Close toast automatically
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white overflow-x-hidden font-sans select-none antialiased">
      
      {/* 1. PHOTOREALISTIC INDUSTRIAL FACTORY BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/src/assets/images/factory_background_1781720422321.jpg"
          alt="High-tech Clean Injection Molding Factory Floor"
          className="w-full h-full object-cover scale-[1.01] brightness-[0.38] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic gradient overlays to integrate with glassmorphic cards */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/60" />
        <div className="absolute inset-0 bg-radial-to-r from-transparent via-black/20 to-[#0a0a0c]/40" />
      </div>

      {/* 2. CHROME BROWSER BAR (TOP FLUID CENTERING) */}
      <header className="relative z-30 pt-3 px-4 w-full">
        <BrowserChrome
          currentUrl="Serviço de BI Cloud Industrial"
          onRefresh={triggerReload}
          isReloading={isReloading}
        />
      </header>

      {/* 3. SIDE NAVIGATION CONTROLS BAR */}
      <Sidebar
        activeScreen="dashboard"
        setActiveScreen={() => {}}
        onSearchClick={() => setShowSearchBox(true)}
        onNotificationsClick={() => setIsAlertsDrawerOpen(true)}
        onMessagesClick={() => setIsChatsDrawerOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        unreadCount={2}
      />

      {/* Main Flow Content Dashboard container */}
      <main className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 lg:pl-24 pb-16 pt-3">
        {/* GLASSMORPHISM ACTIVE DASHBOARD FRAME */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full glass-panel rounded-[32px] p-6 sm:p-7 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden/visible"
        >
          {/* Decorative glowing backlights behind glassmorphism frame */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* TOP CONTROLS SECTION: TITLE, PLANT FILTERS, SUB-TABS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/8 pb-6 mb-6">
            
            {/* Header info / Logo */}
            <div className="flex items-start gap-4">
              {/* IQMS Logo */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-green to-teal-400 flex items-center justify-center shadow-[0_0_12px_rgba(192,255,51,0.3)]">
                  <Cpu className="w-4 h-4 text-zinc-950 font-black animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-display font-bold text-white text-base tracking-wide uppercase">IQMS</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-neon-green/12 text-neon-green font-mono rounded border border-neon-green/15 tracking-tight font-semibold uppercase">Nuvem</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Dassault Systemes</span>
                </div>
              </div>
              
              {/* Dynamic Title */}
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight leading-none">
                  {activeTab === 'summary' && 'Resumo de Manufatura'}
                  {activeTab === 'availability' && 'Análise de Disponibilidade'}
                  {activeTab === 'reject' && 'Análise de Rejeitados'}
                  {activeTab === 'delivery' && 'Métricas de Entrega'}
                </h1>
                <p className="text-xs text-zinc-400 font-sans mt-1">
                  Cluster de monitoramento ativo • Telemetria saudável
                </p>
              </div>
            </div>

            {/* TAB SELECTORS AND FILTER SELECTION CONTROL BUTTONS */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Select Active Analytical Perspective (Sub-Tabs) */}
              <div className="flex bg-black/25 p-1 rounded-2xl border border-white/5 overflow-x-auto select-none no-scrollbar">
                {(['summary', 'availability', 'reject', 'delivery'] as const).map((tab) => {
                  const labels: Record<ActiveTab, string> = {
                    summary: 'Resumo de Produção',
                    availability: 'Disponibilidade Real',
                    reject: 'Qualidade / Rejeitos',
                    delivery: 'Atendimento e Entregas',
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 text-xs font-sans font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-white text-zinc-950 shadow-md font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Plant selection dropdown menu */}
              <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 hover:bg-white/10 rounded-2xl transition-all cursor-pointer">
                  <Sliders className="w-3.5 h-3.5 text-neon-green" />
                  <select
                    value={selectedPlantId}
                    onChange={(e) => setSelectedPlantId(e.target.value)}
                    className="bg-transparent text-xs text-white font-medium focus:outline-hidden pr-4 cursor-pointer font-sans appearance-none"
                    style={{ backgroundPosition: 'right center' }}
                  >
                    <option value="plant-2" className="bg-zinc-900 text-white">Planta 2 - Setor Injeção</option>
                    <option value="plant-1" className="bg-zinc-900 text-white">Planta 1 - Montagem Geral</option>
                    <option value="plant-3" className="bg-zinc-900 text-white">Planta 3 - Compostos Químicos</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none group-hover:text-white" />
                </div>
              </div>

              {/* Quick user avatar */}
              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="w-8 h-8 rounded-full border border-white/12 overflow-hidden cursor-pointer relative group shrink-0"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
                  alt="Sector Supervisor Avatar"
                  className="w-full h-full object-cover grayscale-20"
                />
                <div className="absolute inset-0 bg-neon-green/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

            </div>
          </div>

          {/* PRIMARY GRAPHICS / INFORMATION VIEW GRID */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedPlantId}`}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Quality circular gauge dial */}
                  <div className="lg:col-span-3 flex flex-col items-center">
                    <CircularGauge
                      percentage={activePlant.quality}
                      oee={activePlant.oee}
                      availability={activePlant.availability}
                      performance={activePlant.performance}
                      productionHours={activePlant.productionHours}
                      goodParts={activePlant.goodParts}
                      scrapRate={activePlant.scrapRate}
                    />
                  </div>

                  {/* Right Column: 7 Metrics + 5 widgets grid */}
                  <div className="lg:col-span-9 space-y-6">
                    
                    {/* Row of smaller KPI cards */}
                    <KPICards
                      ePlant={activePlant.topKPIs.ePlant}
                      mfgType={activePlant.topKPIs.mfgType}
                      mfgCell={activePlant.topKPIs.mfgCell}
                      productCount={activePlant.topKPIs.productCount}
                      downtimePercent={activePlant.topKPIs.downtimePercent}
                      totalDowntimeHours={activePlant.topKPIs.totalDowntimeHours}
                      availableActualHours={activePlant.topKPIs.availableActualHours}
                    />

                    {/* Dynamic widget combinations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <OoeByMfgTypeWidget data={activePlant.oeeByMfgType} />
                      <OoeTrendAnnualWidget data={activePlant.oeeTrendAnnual} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <ProductionDowntimeWidget data={activePlant.productionDowntimeHours} />
                      <StandardActualPartsWidget data={activePlant.standardActualParts} />
                      <ScrapByMfgTypeWidget data={activePlant.scrapByMfgType} />
                    </div>

                  </div>

                </div>
              )}

              {/* OTHER PERSPECTIVES TABBED VIEWS CODES */}
              {activeTab === 'availability' && (
                <AvailabilityAnalysisView
                  plantName={activePlant.name}
                  onOpenReportModal={() => setIsDowntimeModalOpen(true)}
                />
              )}

              {activeTab === 'reject' && (
                <RejectAnalysisView
                  plantName={activePlant.name}
                  onOpenReportModal={() => setIsDowntimeModalOpen(true)}
                />
              )}

              {activeTab === 'delivery' && (
                <DeliveryAnalysisView
                  plantName={activePlant.name}
                  onOpenReportModal={() => setIsDowntimeModalOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* BOTTOM PAGING BULLET DOT INDICATORS */}
          <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-white/5 pt-5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="w-8 h-1 rounded-full bg-neon-green" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>

        </motion.div>
      </main>

      {/* 4. MODALS & SUB-PANELS OUTLET STATIONS */}
      
      {/* Downtime Alert Registration popup Dialog */}
      <ReportDowntimeModal
        isOpen={isDowntimeModalOpen}
        onClose={() => setIsDowntimeModalOpen(false)}
        plantName={activePlant.name}
        onSuccess={handleLoggedEvent}
      />

      {/* Right Drawer notifications panel */}
      <SystemNotificationsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
      />

      {/* Message Chat coordination center */}
      <FactoryChatsDrawer
        isOpen={isChatsDrawerOpen}
        onClose={() => setIsChatsDrawerOpen(false)}
      />

      {/* Global Configuration settings overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans">
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
                  <Sliders className="w-4 h-4 text-neon-green" />
                  <h3 className="text-sm font-semibold text-white font-display">Controles do Sistema</h3>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Setting items */}
              <div className="text-xs space-y-3">
                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Conexão MQTT em Tempo Real</div>
                    <div className="text-[10px] text-zinc-500">Transmissão automática via SCADA</div>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-neon-green p-0.5 flex justify-end cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-zinc-950" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Alertas Sonoros / CLP</div>
                    <div className="text-[10px] text-zinc-500">Avisos de paradas críticas</div>
                  </div>
                  <div className="w-8 h-4 rounded-full bg-zinc-650 p-0.5 flex justify-start cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-white/70" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="font-semibold text-white mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-neon-purple animate-pulse" />
                    Mecanismo de IA Preditivo (Machine Learning)
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal mb-2.5">
                    Utiliza o Gemini AI para correlacionar flutuações e ciclos operacionais buscando predizer falhas mecânicas antes que ocorram paradas de CLP severas.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setToastMessage("Análise preditiva iniciada. Verificando ciclos operacionais do CLP...");
                    }}
                    className="w-full py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-indigo-600 font-bold hover:brightness-110 active:scale-98 transition-all cursor-pointer font-sans"
                  >
                    Rodar Diagnóstico Preditivo de IA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. LIVE SEARCH DIALOG DRAWER OVERLAY */}
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
              className="relative w-full max-w-xl glass-panel p-5 rounded-2xl border border-white/10 z-10 space-y-4"
            >
              <div className="flex items-center gap-3 bg-black/25 px-3 py-2.5 rounded-xl border border-white/5">
                <input
                  type="text"
                  placeholder="Consultar subsistemas da fábrica (ex: INJ-104, limites de refugo, qualidade...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white text-xs focus:outline-hidden"
                  autoFocus
                />
                <button onClick={() => setShowSearchBox(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {searchQuery ? (
                <div className="text-[11px] text-zinc-300 font-sans space-y-2">
                  <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase border-b border-white/5 pb-1">Resultados da Busca</div>
                  {['INJ-104', 'Metas de Qualidade', 'Métricas OEE', 'Índices de Refugo'].filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setToastMessage(`Navegando para o nó detalhado: ${item}`);
                        setShowSearchBox(false);
                      }}
                      className="p-2 rounded-lg hover:bg-white/5 hover:text-neon-green cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold">{item}</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Link do Setor</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 font-sans tracking-wide">
                  Digite identificações de equipamentos, operadores de turno, ou números de lote...
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
            className="fixed top-20 right-4 z-50 p-4 rounded-2xl glass-panel border border-neon-green/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] max-w-sm flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-lg bg-neon-green/10 flex items-center justify-center shrink-0 border border-neon-green/15 text-neon-green animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11.5px] font-sans leading-relaxed text-zinc-200 pr-4">
              {toastMessage}
            </div>
            <button onClick={() => setToastMessage(null)} className="p-0.5 rounded text-zinc-500 hover:text-white absolute right-2.5 top-2.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
