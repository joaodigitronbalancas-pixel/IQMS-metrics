import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Share2, Plus, Copy, Search, Globe, Shield } from 'lucide-react';

interface BrowserChromeProps {
  currentUrl?: string;
  onRefresh?: () => void;
  isReloading?: boolean;
}

export default function BrowserChrome({
  currentUrl = 'Serviço de BI Cloud Industrial',
  onRefresh,
  isReloading = false,
}: BrowserChromeProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[620px] mx-auto mb-1 flex items-center gap-3 px-4 py-2 glass-panel rounded-full text-white/70 text-xs shadow-lg border border-white/8 backdrop-blur-md">
      {/* Botões do Navegador */}
      <div className="flex items-center gap-3">
        <button className="p-1 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30" disabled>
          <ChevronLeft className="w-4 h-4 cursor-not-allowed" />
        </button>
        <button className="p-1 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30" disabled>
          <ChevronRight className="w-4 h-4 cursor-not-allowed" />
        </button>
      </div>

      {/* Barra de Endereço */}
      <div className="flex-1 flex items-center justify-between px-3 py-1 bg-black/20 rounded-full border border-white/5 gap-2 select-all hover:bg-black/30 transition-colors cursor-text">
        <div className="flex items-center gap-1.5 min-w-0">
          <Shield className="w-3 h-3 text-neon-green flex-shrink-0" />
          <span className="text-[10px] font-mono tracking-wider text-neon-green font-medium select-none uppercase">https://</span>
          <span className="truncate text-white/90 font-medium font-sans tracking-wide">{currentUrl}</span>
        </div>
        
        <button 
          onClick={onRefresh}
          className={`p-1 rounded-full hover:bg-white/10 transition-colors active:scale-95 cursor-pointer ${isReloading ? 'animate-spin text-neon-green' : 'text-white/50 hover:text-white'}`}
          title="Sincronizar Sistemas Industriais em Tempo Real"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Utilitários */}
      <div className="flex items-center gap-2.5">
        <button className="p-1 rounded-full hover:bg-white/10 transition-colors hover:text-white text-white/60 cursor-pointer" title="Compartilhar relatório de inteligência">
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded-full hover:bg-white/10 transition-colors hover:text-white text-white/60 cursor-pointer" title="Adicionar perspectiva de métricas">
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded-full hover:bg-white/10 transition-colors hover:text-white text-white/60 cursor-pointer" title="Abrir módulos analíticos">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Relógio do Sistema */}
      <div className="hidden sm:flex pl-2 border-l border-white/10 items-center justify-center font-mono text-[10px] text-zinc-400 select-none">
        {timeStr}
      </div>
    </div>
  );
}
