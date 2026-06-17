import React from 'react';
import { motion } from 'motion/react';

interface CircularGaugeProps {
  percentage: number;
  label?: string;
  oee: number;
  availability: number;
  performance: number;
  productionHours: number;
  goodParts: number;
  scrapRate: number;
}

export default function CircularGauge({
  percentage,
  label = 'Qualidade',
  oee,
  availability,
  performance,
  productionHours,
  goodParts,
  scrapRate,
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
            {/* Elegant visual gradients representing neon glowing rings */}
            <linearGradient id="neonGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0ff33" />
              <stop offset="100%" stopColor="#2dd4bf" />
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

          {/* Animated colorful gauge representing Quality progression */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="url(#neonGreenGradient)"
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
            className="text-3xl font-display font-medium text-white tracking-tight"
          >
            {percentage}%
          </motion.span>
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {/* Grid of Sub-Metrics below the circular dial */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-5 w-full text-center border-t border-white/8 pt-5">
        <div>
          <div className="text-xl font-display font-medium text-white">{oee}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
            <span className="text-[10px] text-zinc-400 font-medium">OEE Real</span>
          </div>
        </div>
        <div>
          <div className="text-xl font-display font-medium text-white">{availability}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span className="text-[10px] text-zinc-400 font-medium leading-none">Disponibilidade<br/>Real</span>
          </div>
        </div>
        <div>
          <div className="text-xl font-display font-medium text-white">{performance}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_#c0ff33]" />
            <span className="text-[10px] text-zinc-400 font-medium">Desemp. Real</span>
          </div>
        </div>
      </div>

      {/* Row of physical production quantities */}
      <div className="grid grid-cols-3 gap-2 w-full mt-6 bg-white/3 p-2.5 rounded-2xl border border-white/6">
        <div className="text-center">
          <div className="text-xs font-mono font-medium text-zinc-200">{productionHours.toLocaleString()}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-md bg-purple-400" />
            <span className="text-[9px] text-zinc-400 font-mono tracking-tight">H. Prod.</span>
          </div>
        </div>
        <div className="text-center border-x border-white/8">
          <div className="text-xs font-mono font-medium text-zinc-200">{goodParts.toLocaleString()}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-md bg-neon-green" />
            <span className="text-[9px] text-zinc-400 font-mono tracking-tight">Pçs Boas</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono font-medium text-zinc-200">{scrapRate}%</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-md bg-zinc-500" />
            <span className="text-[9px] text-zinc-400 font-mono tracking-tight">Refugo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
