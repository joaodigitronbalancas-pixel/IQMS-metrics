import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, AlertTriangle, Bell, Trash2, ShieldCheck, Mail, Database, Settings, HelpCircle, Star, ShoppingBag, CreditCard, Tag } from 'lucide-react';
import { InventoryItem, ClientProfile } from '../types';

// ==========================================
// 1. DIALOG: REGISTRAR NOVA VENDA (POS SIMULATOR)
// ==========================================
interface RegisterNewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  clients: ClientProfile[];
  onSuccess: (summary: {
    productId: string;
    quantity: number;
    clientId: string;
    discountPct: number;
    finalPrice: number;
    message: string;
  }) => void;
}

export function ReportDowntimeModal({ 
  isOpen, 
  onClose, 
  inventory = [], 
  clients = [], 
  onSuccess 
}: RegisterNewSaleModalProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discountPct, setDiscountPct] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedClientId) return;

    const product = inventory.find(p => p.id === selectedProductId);
    const client = clients.find(c => c.id === selectedClientId);

    if (!product || !client) return;

    const qty = parseInt(quantity, 10);
    const disc = parseFloat(discountPct);
    const basePrice = product.price * qty;
    const finalPrice = Math.max(0, basePrice * (1 - disc / 100));

    onSuccess({
      productId: selectedProductId,
      quantity: qty,
      clientId: selectedClientId,
      discountPct: disc,
      finalPrice,
      message: `✨ Venda de LUXO Registrada! ${qty}x ${product.name} para a cliente VIP ${client.name} por R$ ${finalPrice.toFixed(2)} (${disc}% desc).`
    });

    onClose();
    // Reset form state safely
    setSelectedProductId('');
    setSelectedClientId('');
    setQuantity('1');
    setDiscountPct('0');
  };

  const activeProduct = inventory.find(p => p.id === selectedProductId);

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
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Terminal PDV Concierge
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Sincronização ERP • Registre Venda Exclusiva</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              
              {/* Product selector */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Selecione o Item do Catálogo</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="">-- Escolha um produto --</option>
                  {inventory.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      [{prod.category}] {prod.name} - R$ {prod.price.toFixed(2)} (Estoque: {prod.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client profile selector */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Cliente VIP do CRM</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="">-- Associar Cliente VIP --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Nível: {c.membershipLevel} (Acumulado: R$ {c.totalSpent.toFixed(0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Discount double column */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-rose-400" />
                    Cupom Desconto (% OFF)
                  </label>
                  <select
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="0">Sem Desconto</option>
                    <option value="5">5% OFF (Padrão)</option>
                    <option value="10">10% OFF (Fidelidade)</option>
                    <option value="15">15% OFF (Aniversário)</option>
                    <option value="20">20% OFF (Campanha Especial)</option>
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-sky-400" />
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'credit', label: 'Cartão VIP' },
                    { id: 'pix', label: 'PIX (Instant)' },
                    { id: 'cash', label: 'Dinheiro' },
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`py-1.5 rounded-lg border text-[10px] text-center font-medium cursor-pointer transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.2)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 text-zinc-300'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview block */}
              {activeProduct && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex justify-between items-center text-[10.5px]">
                  <div>
                    <span className="text-zinc-400 block font-medium">Subtotal da compra:</span>
                    <span className="text-zinc-500 font-mono text-[9px]">
                      {quantity}x R$ {activeProduct.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-300 block text-xs">
                      R$ {Math.max(0, (activeProduct.price * parseInt(quantity || '1', 10)) * (1 - parseFloat(discountPct) / 100)).toFixed(2)}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-400">Total com desconto</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-linear-to-r from-amber-500 to-rose-400 text-black font-bold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              >
                Cobrar & Finalizar Venda
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
    { id: 1, title: 'Ruptura iminente no estoque de "Óculos Retro" (apenas 4 unidades restantes).', time: '10:15', type: 'warning' },
    { id: 2, title: 'Campanha de Inverno "Aura Winter" superou meta do dia em 15% via Instagram.', time: '09:40', type: 'info' },
    { id: 3, title: 'Mariana Alencar finalizou venda exclusiva de R$ 1.250,00.', time: '08:00', type: 'success' },
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
                  <Bell className="w-4 h-4 text-amber-400" />
                  Notificações de Operação
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Sinais automáticos captados do e-commerce & caixas</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 py-5 overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase border-b border-white/5 pb-2 mb-4">
                <span>Eventos Ativos ({notifications.length})</span>
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="hover:text-red-400 transition-colors cursor-pointer">
                    Limpar Todos
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <ShieldCheck className="w-10 h-10 text-amber-500/40 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs">Operações em harmonia. Nenhum alerta crítico.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-1 transition-all ${
                        notif.type === 'warning'
                          ? 'bg-red-500/5 border-red-500/10'
                          : notif.type === 'success'
                          ? 'bg-amber-400/5 border-amber-400/10'
                          : 'bg-white/3 border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <span className="font-medium text-zinc-100 leading-relaxed">{notif.title}</span>
                        <span className="text-[9px] font-mono text-zinc-500 shrink-0 mt-0.5">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 text-center text-zinc-500 font-mono text-[9px] select-none uppercase">
              RECEPÇÃO DE TELEMETRIA OMNICHANNEL ATIVA
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 3. DRAWER: COOPERATIVE CHATS (SAC AND CONCIERGE CHATS)
// ==========================================
export function FactoryChatsDrawer({ isOpen, onClose }: DrawerProps) {
  const [messages, setMessages] = useState([
    { sender: 'vendedora_adriana', text: 'Alessandra pediu para separar um Blazer Off-White tamanho P.', time: '11:05', role: 'Personal Shopper' },
    { sender: 'caixa_central', text: 'Compra de R$ 549,00 compensada via Pix. Sincronizando com estoque fiscal.', time: '11:12', role: 'Caixa' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSend = () => {
    if (!newMsg.trim()) return;
    setMessages([
      ...messages,
      { sender: 'voce_gerente', text: newMsg, time: 'Agora', role: 'Gerente da Filial' },
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
                  <Mail className="w-4 h-4 text-amber-400" />
                  Chat da Boutique (CRM)
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Comunicação ativa do time comercial</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 py-4 overflow-y-auto space-y-3.5 pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className="flex flex-col bg-white/3 p-3 rounded-2xl border border-white/5 gap-0.5 text-xs">
                  <div className="flex justify-between items-center font-mono text-[9px] mb-0.5">
                    <span className="text-amber-400 font-semibold">@{m.sender}</span>
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
                  placeholder="Instruir equipe comercial..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs placeholder-zinc-500 text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  onClick={handleSend}
                  className="p-2.5 bg-amber-400 text-zinc-950 rounded-xl hover:bg-amber-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
