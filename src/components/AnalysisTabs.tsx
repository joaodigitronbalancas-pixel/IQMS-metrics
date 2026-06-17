import React from 'react';
import { motion } from 'motion/react';
import { Play, AlertTriangle, Cpu, HelpCircle, HardDrive, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AnalysisProps {
  plantName: string;
  onOpenReportModal: () => void;
}

// 1. DISPONIBILIDADE (AVAILABILITY) PERSPECTIVE
export function AvailabilityAnalysisView({ plantName, onOpenReportModal }: AnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="glass-card p-5 border border-white/5 rounded-3xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neon-green" />
            Análise de Disponibilidade - {plantName}
          </h4>
          <p className="text-white/80 text-xs leading-relaxed mt-3">
            O tempo de atividade mecânica das injetoras e células CNC está atualmente otimizado em 94.2%. Os setups rápidos (SMED) executados nas últimas 24 horas reduziram o tempo de transição de moldagem em 14 minutos em relação à média mensal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-neon-green text-zinc-950 font-semibold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(192,255,51,0.3)]"
          >
            Registrar Parada de Máquina
          </button>
          <span className="text-[10px] text-zinc-500 font-mono">Último setup: 4h atrás</span>
        </div>
      </div>

      <div className="glass-card p-5 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Status Atual de Ativos IoT</h4>
        <div className="space-y-2.5">
          {[
            { id: 'INJ-401', status: 'Operacional', cycle: '22s', temp: '62°C', health: 'Ótima' },
            { id: 'INJ-402', status: 'Em Setup', cycle: '-', temp: '45°C', health: 'Atenção' },
            { id: 'CNC-08', status: 'Operacional', cycle: '115s', temp: '71°C', health: 'Excelente' },
          ].map((machine, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-white/3 font-mono">
              <span className="font-semibold text-white">{machine.id}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                machine.status === 'Operacional' ? 'bg-neon-green/10 text-neon-green' : 'bg-amber-400/10 text-amber-400'
              }`}>
                {machine.status}
              </span>
              <span className="text-zinc-400">Ciclo: {machine.cycle}</span>
              <span className="text-zinc-500">{machine.health}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. REJEITOS/QUALIDADE (REJECT) PERSPECTIVE
export function RejectAnalysisView({ plantName, onOpenReportModal }: AnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="glass-card p-5 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Métricas de Rejeito e Refugo - {plantName}
        </h4>
        <p className="text-white/80 text-xs leading-relaxed mt-3">
          A taxa média de refugo nesta semana fixou-se em 1.8%, mantendo-se confortavelmente abaixo do teto de qualidade regulatória de 2.5%. A maior causa de inconformidade foi a dilatação mecânica por variação térmica na partida do lote 04.
        </p>
        <div className="mt-5 p-3 rounded-2xl bg-white/3 border border-white/5 flex justify-between items-center text-xs">
          <div>
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Pós-Processamento</span>
            <span className="font-semibold text-white">Moagem de sucata ativa</span>
          </div>
          <span className="text-[10px] text-neon-green font-mono">92% Reaproveitado</span>
        </div>
      </div>

      <div className="glass-card p-5 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Principais Falhas Físicas Detectadas</h4>
        <div className="space-y-3 mt-2">
          {[
            { tag: 'Bolhas de Ar', pct: 48, count: '142 pçs', color: 'bg-red-400' },
            { tag: 'Rebarbas de Fechamento', pct: 32, count: '94 pçs', color: 'bg-amber-400' },
            { tag: 'Preenchimento Incompleto', pct: 20, count: '59 pçs', color: 'bg-zinc-500' },
          ].map((defect, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">{defect.tag}</span>
                <span className="text-zinc-400 font-semibold">{defect.count} ({defect.pct}%)</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div style={{ width: `${defect.pct}%` }} className={`h-full ${defect.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. ENTREGA/LOGÍSTICA (DELIVERY) PERSPECTIVE
export function DeliveryAnalysisView({ plantName, onOpenReportModal }: AnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="glass-card p-5 border border-white/5 rounded-3xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neon-green" />
            Atendimento de Cronograma - {plantName}
          </h4>
          <p className="text-white/80 text-xs leading-relaxed mt-3">
            O índice de cumprimento do plano de embarque consolidado atingiu 98.4%. Todos os lotes sequenciados para as montadoras parceiras foram consolidados com etiqueta inteligível IQMS barcoded.
          </p>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-4 mt-4">
          <span className="text-zinc-500">Status Sequenciador Just-in-Time:</span>
          <span className="text-neon-green font-semibold">SINCRONIZADO</span>
        </div>
      </div>

      <div className="glass-card p-5 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Monitor de Expedição em Lote</h4>
        <div className="space-y-2.5">
          {[
            { order: 'OP-4402', target: 'Fiat Betim', progress: 100, status: 'Concluído' },
            { order: 'OP-4409', target: 'VW Anchieta', progress: 85, status: 'Em Produção' },
            { order: 'OP-4412', target: 'GM Gravataí', progress: 0, status: 'Fila Set' },
          ].map((ord, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/3 font-mono">
              <span className="font-semibold text-white">{ord.order}</span>
              <span className="text-zinc-400 truncate max-w-[90px]">{ord.target}</span>
              <span className="text-zinc-500">{ord.progress}%</span>
              <span className={`text-[10px] font-sans font-medium ${ord.progress === 100 ? 'text-neon-green' : 'text-zinc-400'}`}>
                {ord.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
