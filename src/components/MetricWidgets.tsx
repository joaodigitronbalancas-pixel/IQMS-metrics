import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, TrendingUp, TrendingDown, Info, ShoppingBag } from 'lucide-react';
import { StoreBranchData } from '../types';

interface WidgetWrapperProps {
  title: string;
  value: string | number;
  changeValue: string;
  trend: 'up' | 'down';
  children: React.ReactNode;
  purpleTheme?: boolean;
}

function WidgetWrapper({ title, value, changeValue, trend, children, purpleTheme = false }: WidgetWrapperProps) {
  const isUp = trend === 'up';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative p-5 rounded-3xl border flex flex-col justify-between overflow-hidden min-h-[220px] transition-all duration-300 ${
        purpleTheme
          ? 'bg-linear-to-b from-amber-600/20 to-rose-950/40 border-amber-500/20 shadow-[inset_0_1px_30px_rgba(245,158,11,0.15)] text-white'
          : 'glass-card border-white/5 hover:border-white/10 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Top Header Row of Widget */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className={`text-[11px] font-sans font-semibold uppercase tracking-wider ${purpleTheme ? 'text-amber-200' : 'text-zinc-400'}`}>
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-display font-bold tracking-tight">{value}</span>
            <span
              className={`text-xs font-medium flex items-center gap-0.5 ${
                isUp
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {changeValue}
            </span>
          </div>
        </div>
        
        {/* Sleek action trigger icon */}
        <button className={`p-1.5 rounded-full transition-colors cursor-pointer ${purpleTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'}`}>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Graph/Content Area */}
      <div className="flex-1 flex items-end mt-4 min-h-[90px]">
        {children}
      </div>
    </motion.div>
  );
}

// 1. SALES BY PRODUCT TYPE CARD (Apparel vs Accessories)
export function OoeByMfgTypeWidget({ data }: { data: StoreBranchData['salesByProductType'] }) {
  const apparelPct = (data.apparelSales / (data.apparelSales + data.accessorySales)) * 100;
  const accessoryPct = (data.accessorySales / (data.apparelSales + data.accessorySales)) * 100;

  return (
    <WidgetWrapper
      title="Faturamento por Segmento de Produto"
      value={`R$ ${data.totalRevenue.toFixed(1)}k`}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full flex flex-col gap-3 font-sans">
        {/* Horizontal Stack Progress bar */}
        <div className="h-6 w-full rounded-lg overflow-hidden bg-black/30 flex border border-white/5 relative">
          <div 
            style={{ width: `${apparelPct}%` }} 
            className="h-full bg-linear-to-r from-amber-500 to-rose-400 relative group-hover:opacity-90 transition-all duration-300 border-r border-white/10"
            title={`Vestuário: R$ ${data.apparelSales.toFixed(1)}k`}
          />
          <div 
            style={{ width: `${accessoryPct}%` }} 
            className="h-full bg-linear-to-r from-teal-400 to-emerald-400 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]"
            title={`Acessórios: R$ ${data.accessorySales.toFixed(1)}k`}
          />
        </div>

        {/* Labels underneath */}
        <div className="flex justify-between items-center text-[10px] font-mono tracking-tight text-zinc-300">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <div>
              <span className="text-zinc-500">Vestuário:</span>{' '}
              <span className="font-semibold text-white">R$ {data.apparelSales.toFixed(1)}k ({apparelPct.toFixed(0)}%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.5)]" />
            <div>
              <span className="text-zinc-500">Acessórios:</span>{' '}
              <span className="font-semibold text-white">R$ {data.accessorySales.toFixed(1)}k ({accessoryPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 2. SEASONAL SPEND VALUE (LUXURY GOLD PANEL)
export function OoeTrendAnnualWidget({ data }: { data: StoreBranchData['salesTrendAnnual'] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  return (
    <WidgetWrapper
      title="Ticket Médio por Coleção Sazonal"
      value={`R$ ${data.averageTicket}`}
      changeValue={data.change}
      trend={data.trend}
      purpleTheme={true}
    >
      <div className="w-full h-[95px] flex items-end justify-between gap-3 relative px-1">
        {data.bars.map((bar, idx) => {
          // Normalize height max target of R$ 500
          const heightPct = `${(bar.value / 500) * 100}%`;
          
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Individual solid rounded glass column */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: heightPct }}
                transition={{ duration: 0.8, delay: idx * 0.05, ease: 'backOut' }}
                className={`w-full rounded-t-lg relative transition-all duration-300 ${
                  hoveredIdx === idx 
                    ? 'bg-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.7)]' 
                    : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                {/* Numeric tag inside or above column */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-tighter text-white/90 font-medium">
                  R${bar.value}
                </div>
              </motion.div>

              {/* Sub-label under each column */}
              <span className="text-[9px] font-mono uppercase text-amber-200 mt-2 tracking-tighter shrink-0 select-none font-medium">
                {bar.label}
              </span>

              {/* Tooltip detail block */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: -45 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className="absolute z-20 px-2.5 py-1 glass-panel text-[10px] text-white rounded-md whitespace-nowrap pointer-events-none border border-amber-500/35"
                  >
                    Coleção: <span className="font-semibold text-amber-400">{bar.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

// 3. HOURLY TRAFFIC AND COMPLETED TRANSACTIONS
export function ProductionDowntimeWidget({ data }: { data: StoreBranchData['hourlyTrafficSales'] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <WidgetWrapper
      title="Fluxo Horário: Clientes vs Vendas"
      value={data.averageTraffic}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full h-[95px] flex items-end justify-between gap-1 px-1">
        {data.series.map((item, idx) => {
          // Normalize heights with visual multiplier limits (traffic peaks at 300 online/offline, sales at 100)
          const trafficHeight = `${Math.min((item.visitors / 250) * 100, 100)}%`;
          const salesHeight = `${Math.min((item.transactions / 80) * 100, 100)}%`;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full relative cursor-crosshair group-graph"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Dual bars representing Visitors (Rose) vs Completed POS sales (Teal) */}
              <div className="flex items-end gap-[2px] w-full h-[80%] justify-center">
                {/* Traffic / Visitors column */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: trafficHeight }}
                  transition={{ duration: 0.7, delay: idx * 0.03 }}
                  className="w-2 rounded-t-sm bg-rose-450/80 group-hover:bg-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.2)]"
                />
                {/* Finalized POS Purchases column */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: salesHeight }}
                  transition={{ duration: 0.7, delay: idx * 0.03 + 0.1 }}
                  className="w-2 rounded-t-sm bg-teal-400/90 group-hover:bg-white"
                />
              </div>

              {/* Time reference tag */}
              <span className="text-[7.5px] font-mono text-zinc-500 mt-2 leading-none select-none">
                {item.time}
              </span>

              {/* Interactive Tooltip bubble */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -78 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-20 p-2 glass-panel text-[9px] rounded-lg border border-white/10 text-white min-w-[110px] pointer-events-none"
                  >
                    <div className="font-bold border-b border-white/10 pb-0.5 mb-1 font-mono text-amber-400">{item.time}</div>
                    <div className="flex justify-between">
                      <span>Visitantes:</span>
                      <span className="font-semibold text-rose-300">{item.visitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transações:</span>
                      <span className="font-semibold text-teal-300">{item.transactions}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

// 4. STORES IDEAL PRODUCT DISTRIBUTION VS REAL STOCK
export function StandardActualPartsWidget({ data }: { data: StoreBranchData['inventoryTargetActual'] }) {
  const [activeType, setActiveType] = useState<'all' | 'standard' | 'actual'>('all');

  return (
    <WidgetWrapper
      title="Compliance de Mix de Estoque"
      value={`${data.complianceCoefficient}%`}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full flex flex-col h-full justify-between gap-2.5">
        {/* SVG Scatter/Bubble Stage */}
        <div className="flex-1 bg-black/15 border border-white/5 rounded-2xl relative overflow-hidden min-h-[75px]">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-15 pointer-events-none">
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-full" />
          </div>

          {/* Render bubbles in absolute alignment floating */}
          <svg className="w-full h-full p-2.5">
            <defs>
              <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </radialGradient>
              <radialGradient id="actualSalesGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </radialGradient>
            </defs>
            
            {data.bubbles
              .filter(bubble => activeType === 'all' || bubble.type === activeType)
              .map((bubble, idx) => {
                const isActual = bubble.type === 'actual';
                const color = isActual ? '#f59e0b' : '#38bdf8';
                const radialId = isActual ? 'url(#actualSalesGlow)' : 'url(#targetGlow)';
                
                return (
                  <g key={idx}>
                    {/* Shadow/Glow layer */}
                    <circle
                      cx={`${bubble.x}%`}
                      cy={`${bubble.y}%`}
                      r={bubble.size + 4}
                      fill={radialId}
                      className="transition-all duration-300"
                    />
                    
                    {/* Core solid circle dot */}
                    <motion.circle
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.85 }}
                      transition={{ type: 'spring', delay: idx * 0.02 }}
                      cx={`${bubble.x}%`}
                      cy={`${bubble.y}%`}
                      r={bubble.size / 3}
                      fill={color}
                      className="cursor-pointer hover:r-7 transition-all duration-200"
                    />
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Toggle Controls to filter bubble categories */}
        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveType('all')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${activeType === 'all' ? 'bg-white/12 text-white font-medium' : 'hover:text-white'}`}
            >
              TODOS
            </button>
            <button
              onClick={() => setActiveType('standard')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${activeType === 'standard' ? 'bg-white/12 text-white font-medium' : 'hover:text-white'}`}
            >
              IDEAL
            </button>
            <button
              onClick={() => setActiveType('actual')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${activeType === 'actual' ? 'bg-white/12 text-white font-medium' : 'hover:text-white'}`}
            >
              REAL
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-[8px] leading-none text-zinc-500 font-mono tracking-tighter">IDEAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[8px] leading-none text-zinc-500 font-mono tracking-tighter">REAL</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 5. EXCHANGE & RETURN RATE PROGRESS MONTHS (SMOOTH AREA GRAPH)
export function ScrapByMfgTypeWidget({ data }: { data: StoreBranchData['returnsByCategory'] }) {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // SVG Area path computations
  const width = 300;
  const height = 75;
  const maxScrap = Math.max(...data.points.map(p => p.rate), 0.1);
  const padding = 10;

  // Convert data coordinates to SVG pixel path
  const pointsString = data.points.map((p, idx) => {
    const x = padding + (idx / (data.points.length - 1)) * (width - 2 * padding);
    const y = height - padding - (p.rate / maxScrap) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const closedAreaPath = `
    M ${padding} ${height - padding} 
    L ${pointsString} 
    L ${width - padding} ${height - padding} 
    Z
  `;

  return (
    <WidgetWrapper
      title="Taxa Mensal de Trocas e Devoluções"
      value={`${data.percent}%`}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full flex flex-col h-full justify-between gap-1">
        {/* SVG Bezier Area Chart */}
        <div className="flex-1 bg-black/10 rounded-2xl relative overflow-hidden flex items-end">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              {/* Smooth Glowing gradients represent exchange margins */}
              <linearGradient id="returnAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="returnLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>

            {/* Filled area shape */}
            <path d={closedAreaPath} fill="url(#returnAreaGradient)" className="transition-all duration-500" />

            {/* Main connecting path stroke */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              d={`M ${pointsString}`}
              fill="none"
              stroke="url(#returnLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-500"
            />

            {/* Invisible interactive circles for hover details */}
            {data.points.map((p, idx) => {
              const x = padding + (idx / (data.points.length - 1)) * (width - 2 * padding);
              const y = height - padding - (p.rate / maxScrap) * (height - 2 * padding);

              return (
                <g key={idx}>
                  {/* Glowing hover node circles */}
                  {hoveredPoint?.idx === idx && (
                    <circle cx={x} cy={y} r="5" fill="#f43f5e" opacity="0.6" className="animate-ping" />
                  )}
                  {/* Visible point circle dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#18181b"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-transform hover:scale-125"
                    onMouseEnter={() => setHoveredPoint({ ...p, x, y, idx })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Absolute floating micro tooltip overlay */}
          <AnimatePresence>
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bg-zinc-950/90 text-white rounded-md px-1.5 py-0.5 text-[8.5px] border border-rose-500/30 whitespace-nowrap pointer-events-none"
                style={{
                  left: `${(hoveredPoint.idx / (data.points.length - 1)) * 82}%`,
                  bottom: '38px',
                }}
              >
                <span>{hoveredPoint.month}:</span>{' '}
                <span className="font-semibold text-rose-450">{hoveredPoint.rate}%</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic x-axis labels */}
        <div className="flex justify-between px-2 text-[7.5px] font-mono text-zinc-500 mt-1 select-none">
          {data.points.map((p, idx) => (
            <span key={idx}>{p.month}</span>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}
