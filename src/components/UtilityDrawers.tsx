import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, AlertTriangle, Bell, Trash2, ShieldCheck, Mail, Database, Settings, HelpCircle, HardDrive, CheckCircle } from 'lucide-react';

// ==========================================
// 1. DIALOG: REGISTRAR TEMPO DE PARADA (REPORT DOWNTIME MODAL)
// ==========================================
interface ReportDowntimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
  onSuccess: (msg: string) => void;
}

export function ReportDowntimeModal({ isOpen, onClose, plantName, onSuccess }: ReportDowntimeModalProps) {
  const [machine, setMachine] = useState('');
  const [reason, setReason] = useState('mechanical');
  const [minutes, setMinutes] = useState('30');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine.trim()) return;

    const reasonLabel = {
      mechanical: 'Falha Mecânica',
      electrical: 'Falha Elétrica',
      setup: 'Ajuste / Setup de Molde',
      material: 'Falta de Matéria-Prima',
    }[reason] || 'Parada Indefinida';

    onSuccess(`Parada de máquina registrada com sucesso para o ativo ${machine} (${reasonLabel})!`);
    onClose();
    // Reset
    setMachine('');
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-white/10 z-10 text-white"
          >
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Registrar Parada Crítica</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">{plantName} • Sincronia Scada Online</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Identificador da Máquina / Ativo IoT</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: INJ-401, CNC-08"
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-neon-green/60 text-white rounded-xl px-3 py-2 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Razão principal do incidente</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="mechanical">Falha Mecânica (Ruptura, Sensor, Mancal)</option>
                  <option value="electrical">Falha Elétrica / Painel de Comando</option>
                  <option value="setup">Ajuste / Troca de Molde (Setup SMED)</option>
                  <option value="material">Abastecimento de Resina / Falta Material</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Duração estimada (Minutos)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Observações / Plano de Ação Rápida</label>
                <textarea
                  rows={2}
                  placeholder="Descreva brevemente a causa raiz ou instruções aos técnicos..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-1.5 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-linear-to-r from-neon-green to-teal-400 text-zinc-950 font-bold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-[0_0_12px_rgba(192,255,51,0.25)]"
              >
                Salvar Registro de Ocorrência
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 2. DRAWER: SYSTEM ALERTS AND NOTIFICATIONS
// ==========================================
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemNotificationsDrawer({ isOpen, onClose }: DrawerProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Flutuação de temperatura detectada na célula INJ-401 (+4.5°C)', time: '10:15', type: 'warning' },
    { id: 2, title: 'Parada programada para setup da máquina CNC-08 iniciada', time: '09:40', type: 'info' },
    { id: 3, title: 'Meta de produção horária superada em 12% no Setor A', time: '08:00', type: 'success' },
  ]);

  const clearAll = () => setNotifications([]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[420px] h-full bg-zinc-950/95 border-l border-white/5 shadow-2.5xl flex flex-col justify-between py-6 px-5 z-10 backdrop-blur-xl text-white font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-neon-green" />
                  Alertas do Sistema IoT
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Eventos automáticos coletados via CLP</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 py-5 overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase border-b border-white/5 pb-2 mb-4">
                <span>Lista de Eventos ({notifications.length})</span>
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="hover:text-red-400 transition-colors cursor-pointer">
                    Limpar Todos
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <ShieldCheck className="w-10 h-10 text-neon-green/40 mx-auto mb-2" />
                    <p className="text-xs">Sem alertas pendentes no momento.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-1 transition-all ${
                        notif.type === 'warning'
                          ? 'bg-red-500/5 border-red-500/10'
                          : notif.type === 'success'
                          ? 'bg-neon-green/5 border-neon-green/10'
                          : 'bg-white/3 border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <span className="font-medium text-zinc-100">{notif.title}</span>
                        <span className="text-[9px] font-mono text-zinc-500 shrink-0">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 text-center text-zinc-500 font-mono text-[9px] select-none uppercase">
              RECEPÇÃO DE TELEMETRIA ATIVA
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 3. DRAWER: COOPERATIVE OPERATOR CHATS
// ==========================================
export function FactoryChatsDrawer({ isOpen, onClose }: DrawerProps) {
  const [messages, setMessages] = useState([
    { sender: 'supervisor_santos', text: 'Favor verificar a pressao hidraulica da Injetora #3.', time: '11:05', role: 'Supervisão' },
    { sender: 'operador_roberto', text: 'Vazão normalizada e calibrada de acordo com ficha técnica.', time: '11:12', role: 'Operador' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSend = () => {
    if (!newMsg.trim()) return;
    setMessages([
      ...messages,
      { sender: 'voce_supervisor', text: newMsg, time: 'Agora', role: 'Supervisão' },
    ]);
    setNewMsg('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[420px] h-full bg-zinc-950/95 border-l border-white/5 shadow-2.5xl flex flex-col justify-between py-6 px-5 z-10 backdrop-blur-xl text-white font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neon-green" />
                  Chat de Operações
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Mensagens diretas de chão de fábrica</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 py-4 overflow-y-auto space-y-3.5 pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className="flex flex-col bg-white/3 p-3 rounded-2xl border border-white/5 gap-1 text-xs">
                  <div className="flex justify-between items-center font-mono text-[9px] mb-0.5">
                    <span className="text-neon-green font-semibold">@{m.sender}</span>
                    <span className="text-zinc-500">{m.time} • {m.role}</span>
                  </div>
                  <p className="text-zinc-200 font-sans leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite uma mensagem importante ao time..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs placeholder-zinc-500 text-white focus:outline-none focus:border-neon-green/45 transition-colors"
                />
                <button
                  onClick={handleSend}
                  className="p-2.5 bg-neon-green text-gray-950 rounded-xl hover:bg-neon-green/90 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
