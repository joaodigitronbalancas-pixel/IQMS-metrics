import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, TrendingUp, TrendingDown, Info, HelpCircle } from 'lucide-react';
import { PlantData } from '../types';

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
          ? 'bg-linear-to-b from-purple-600/25 to-indigo-900/40 border-purple-500/20 shadow-[inset_0_1px_30px_rgba(168,85,247,0.15)] text-white'
          : 'glass-card border-white/5 hover:border-white/10 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Top Header Row of Widget */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className={`text-[11px] font-sans font-semibold uppercase tracking-wider ${purpleTheme ? 'text-purple-200' : 'text-zinc-400'}`}>
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-display font-bold tracking-tight">{value}</span>
            <span
              className={`text-xs font-medium flex items-center gap-0.5 ${
                isUp
                  ? purpleTheme ? 'text-neon-green' : 'text-emerald-400'
                  : purpleTheme ? 'text-white/75' : 'text-rose-400'
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

// 1. OOE BY MFG TYPE CARD
export function OoeByMfgTypeWidget({ data }: { data: PlantData['oeeByMfgType'] }) {
  const genericPct = (data.genericTime / (data.genericTime + data.injectionTime)) * 100;
  const injectionPct = (data.injectionTime / (data.genericTime + data.injectionTime)) * 100;

  return (
    <WidgetWrapper
      title="OOE por Tipo de MFG"
      value={`${data.total}%`}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full flex flex-col gap-3 font-sans">
        {/* Horizontal Stack Progress bar */}
        <div className="h-6 w-full rounded-lg overflow-hidden bg-black/30 flex border border-white/5 relative">
          <div 
            style={{ width: `${genericPct}%` }} 
            className="h-full bg-repeating-stripes bg-zinc-600/40 relative group-hover:opacity-90 transition-all duration-300 border-r border-white/10"
            title={`Tempo Genérico: ${data.genericTime.toLocaleString()}h`}
          />
          <div 
            style={{ width: `${injectionPct}%` }} 
            className="h-full bg-gradient-to-r from-neon-green to-teal-400 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]"
            title={`Tempo de Injeção: ${data.injectionTime.toLocaleString()}h`}
          />
        </div>

        {/* Labels underneath */}
        <div className="flex justify-between items-center text-[11px] font-mono tracking-tight text-zinc-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-zinc-600/60 border border-white/10" />
            <div>
              <span className="text-zinc-500">Genérico:</span>{' '}
              <span className="font-semibold text-white">{data.genericTime.toLocaleString()}h</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-neon-green shadow-[0_0_6px_rgba(192,255,51,0.5)]" />
            <div>
              <span className="text-zinc-500">Injeção:</span>{' '}
              <span className="font-semibold text-white">{data.injectionTime.toLocaleString()}h</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 2. OOE TREND AVERAGE ANNUAL (PURPLE INTUITIVE PANEL)
export function OoeTrendAnnualWidget({ data }: { data: PlantData['oeeTrendAnnual'] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  return (
    <WidgetWrapper
      title="Média Anual de Tendência OEE"
      value={`${data.average}%`}
      changeValue={data.change}
      trend={data.trend}
      purpleTheme={true}
    >
      <div className="w-full h-[95px] flex items-end justify-between gap-3 relative px-1">
        {data.bars.map((bar, idx) => {
          const heightPct = `${bar.value}%`;
          const ptType = bar.type === 'Injective' ? 'Molding' : 'Geral';
          
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
                    ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {/* Numeric tag inside or above column */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-tighter text-white/90">
                  {bar.value.toFixed(1)}%
                </div>
              </motion.div>

              {/* Sub-label under each column */}
              <span className="text-[8px] font-mono uppercase text-purple-200 mt-2 tracking-tighter shrink-0 select-none">
                {ptType}
              </span>

              {/* Tooltip detail block */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: -45 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className="absolute z-20 px-2 py-1 glass-panel text-[10px] text-white rounded-md whitespace-nowrap pointer-events-none"
                  >
                    Anual: <span className="font-semibold text-neon-green">{bar.label}</span>
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

// 3. PRODUCTION & DOWNTIME HOUR SERIES (BARS)
export function ProductionDowntimeWidget({ data }: { data: PlantData['productionDowntimeHours'] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <WidgetWrapper
      title="Horas de Produção e Paradas"
      value={`${data.average}%`}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full h-[95px] flex items-end justify-between gap-1 px-1">
        {data.series.map((item, idx) => {
          // Normalize heights for visualization
          const prodHeight = `${(item.production / 100) * 80}%`;
          const downHeight = `${(item.downtime / 100) * 80}%`;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full relative cursor-crosshair group-graph"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Two side-by-side slim bars representing Prod (Neon) vs Down (Purple/White) */}
              <div className="flex items-end gap-[2px] w-full h-[80%] justify-center">
                {/* Production bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: prodHeight }}
                  transition={{ duration: 0.7, delay: idx * 0.03 }}
                  className="w-2 rounded-t-sm bg-neon-green/90 group-hover:bg-neon-green shadow-[0_0_4px_rgba(192,255,51,0.2)]"
                />
                {/* Downtime bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: downHeight }}
                  transition={{ duration: 0.7, delay: idx * 0.03 + 0.1 }}
                  className="w-2 rounded-t-sm bg-purple-400/80 group-hover:bg-white"
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
                    className="absolute z-20 p-2 glass-panel text-[9px] rounded-lg border border-white/10 text-white min-w-[100px] pointer-events-none"
                  >
                    <div className="font-bold border-b border-white/10 pb-0.5 mb-1 font-mono text-zinc-400">{item.time}</div>
                    <div className="flex justify-between">
                      <span>Prod:</span>
                      <span className="font-semibold text-neon-green">{item.production}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parada:</span>
                      <span className="font-semibold text-white">{item.downtime}h</span>
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

// 4. STANDARD AND ACTUAL PARTS (BUBBLE CHART)
export function StandardActualPartsWidget({ data }: { data: PlantData['standardActualParts'] }) {
  const [activeType, setActiveType] = useState<'all' | 'standard' | 'actual'>('all');

  return (
    <WidgetWrapper
      title="Peças Padrão vs. Peças Reais"
      value={`${data.coefficient}%`}
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
              <radialGradient id="standardGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
              </radialGradient>
              <radialGradient id="actualGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c0ff33" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#c0ff33" stopOpacity="0.02" />
              </radialGradient>
            </defs>
            
            {data.bubbles
              .filter(bubble => activeType === 'all' || bubble.type === activeType)
              .map((bubble, idx) => {
                const isActual = bubble.type === 'actual';
                const color = isActual ? '#c0ff33' : '#ffffff';
                const radialId = isActual ? 'url(#actualGlow)' : 'url(#standardGlow)';
                
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
              PADRÃO
            </button>
            <button
              onClick={() => setActiveType('actual')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${activeType === 'actual' ? 'bg-white/12 text-white font-medium' : 'hover:text-white'}`}
            >
              REAL
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[8px] leading-none text-zinc-500 font-mono tracking-tighter">PAD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
            <span className="text-[8px] leading-none text-zinc-500 font-mono tracking-tighter">REAL</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

// 5. SCRAP % BY MFG TYPE (SMOOTH AREA GRAPH)
export function ScrapByMfgTypeWidget({ data }: { data: PlantData['scrapByMfgType'] }) {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // SVG Area path computations
  const width = 300;
  const height = 75;
  const maxScrap = Math.max(...data.points.map(p => p.scrap), 0.1);
  const padding = 10;

  // Convert data coordinates to SVG pixel path
  const pointsString = data.points.map((p, idx) => {
    const x = padding + (idx / (data.points.length - 1)) * (width - 2 * padding);
    const y = height - padding - (p.scrap / maxScrap) * (height - 2 * padding);
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
      title="Porcentagem de Refugo por MFG"
      value={`${data.percent}%`}
      changeValue={data.change}
      trend={data.trend}
    >
      <div className="w-full flex flex-col h-full justify-between gap-1">
        {/* SVG Bezier Area Chart */}
        <div className="flex-1 bg-black/10 rounded-2xl relative overflow-hidden flex items-end">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              {/* Smooth Glowing gradients represent scrap margins */}
              <linearGradient id="scrapAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="scrapLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>

            {/* Filled area shape */}
            <path d={closedAreaPath} fill="url(#scrapAreaGradient)" className="transition-all duration-500" />

            {/* Main connecting path stroke */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              d={`M ${pointsString}`}
              fill="none"
              stroke="url(#scrapLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-500"
            />

            {/* Invisible interactive circles for hover details */}
            {data.points.map((p, idx) => {
              const x = padding + (idx / (data.points.length - 1)) * (width - 2 * padding);
              const y = height - padding - (p.scrap / maxScrap) * (height - 2 * padding);

              return (
                <g key={idx}>
                  {/* Glowing hover node circles */}
                  {hoveredPoint?.idx === idx && (
                    <circle cx={x} cy={y} r="5" fill="#f87171" opacity="0.6" className="animate-ping" />
                  )}
                  {/* Visible point circle dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#18181b"
                    stroke="#fb7185"
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
                className="absolute bg-zinc-950/90 text-white rounded-md px-1.5 py-0.5 text-[8.5px] border border-red-500/30 whitespace-nowrap pointer-events-none"
                style={{
                  left: `${(hoveredPoint.idx / (data.points.length - 1)) * 82}%`,
                  bottom: '38px',
                }}
              >
                <span>{hoveredPoint.month}:</span>{' '}
                <span className="font-semibold text-red-400">{hoveredPoint.scrap}%</span>
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
