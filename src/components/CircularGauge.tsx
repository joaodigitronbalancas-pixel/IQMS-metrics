import React from 'react';
import { motion } from 'motion/react';

interface CircularGaugeProps {
  percentage: number; // Meta Mensal de Venda %
  label?: string;
  averageTicket: number;
  conversionRate: number;
  grossMargin: number;
  activeHours: number;
  partsSold: number;
  returnRate: number;
}

export default function CircularGauge({
  percentage,
  label = 'Meta de Vendas',
  averageTicket,
  conversionRate,
  grossMargin,
  activeHours,
  partsSold,
  returnRate,
}: CircularGaugeProps) {
  // SVG drawing configuration
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer wrapper gauge circular path representation */}
      <div className="relative flex items-center justify-center w-48 h-48 mb-6">
        <svg className="w-full h-full rotate-90" viewBox="0 0 160 160">
          <defs>
            {/* Elegant luxury visual gradients representing neon gold/glowing boutique aesthetics */}
            <linearGradient id="neonGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" /> {/* Amber 500 */}
              <stop offset="100%" stopColor="#fb7185" /> {/* Rose 400 */}
            </linearGradient>
            
            {/* Subtle glow filter */}
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Underlayer grey track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
          />

          {/* Inner ring helper */}
          <circle
            cx="80"
            cy="80"
            r={radius - 9}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.02)"
            strokeWidth={1}
            strokeDasharray="4, 4"
          />

          {/* Animated colorful gauge representing Sales Goals progression */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="url(#neonGoldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Middle centered details text block */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-display font-semibold text-white tracking-tight"
          >
            {percentage.toFixed(1)}%
          </motion.span>
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mt-1">
            {label}
          </span>
        </div>
      </div>

      {/* Grid of Sub-Metrics below the circular dial */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-4 w-full text-center border-t border-white/8 pt-5">
        <div>
          <div className="text-[15px] font-display font-bold text-white">R$ {averageTicket.toFixed(0)}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-[10px] text-zinc-400 font-medium">Ticket Médio</span>
          </div>
        </div>
        <div>
          <div className="text-[15px] font-display font-bold text-white">{conversionRate}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span className="text-[10px] text-zinc-400 font-medium leading-none">Conversão Comercial</span>
          </div>
        </div>
        <div>
          <div className="text-[15px] font-display font-bold text-white">{grossMargin}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
            <span className="text-[10px] text-zinc-400 font-medium">Margem Real</span>
          </div>
        </div>
      </div>

      {/* Row of physical production quantities */}
      <div className="grid grid-cols-3 gap-2 w-full mt-6 bg-white/3 p-2.5 rounded-2xl border border-white/6">
        <div className="text-center">
          <div className="text-xs font-mono font-medium text-zinc-200">{activeHours.toLocaleString()}h</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-md bg-purple-400" />
            <span className="text-[9px] text-zinc-400 font-mono tracking-tight">Horas Venda</span>
          </div>
        </div>
        <div className="text-center border-x border-white/8">
          <div className="text-xs font-mono font-medium text-zinc-200">{partsSold.toLocaleString()}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-md bg-emerald-400" />
            <span className="text-[9px] text-zinc-400 font-mono tracking-tight">Pçs Vendidas</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono font-medium text-zinc-200">{returnRate}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-md bg-zinc-500" />
            <span className="text-[9px] text-zinc-400 font-mono tracking-tight">Trocas / Devol.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
