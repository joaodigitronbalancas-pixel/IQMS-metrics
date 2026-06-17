import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, AlertTriangle, Package, Check, ClipboardList, TrendingUp, HelpCircle, Star, ShoppingBag, Truck } from 'lucide-react';
import { InventoryItem, ClientProfile } from '../types';

interface InventoryAnalysisProps {
  inventory: InventoryItem[];
  onAddStock: (productId: string, qty: number) => void;
  onOpenNewProductModal: () => void;
}

// 1. DYNAMIC CATALOGUE & STOCK CONTROLLER TAB
export function InventoryAnalysisView({
  inventory,
  onAddStock,
  onOpenNewProductModal
}: InventoryAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');

  // Filtering variables
  const categories = ['TODOS', 'Roupas', 'Acessórios', 'Bolsas', 'Calçados'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TODOS' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Left Columns - Advanced Interactive Feed of Stock */}
      <div className="lg:col-span-2 glass-card p-5 border border-white/5 rounded-3xl flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                Catálogo Geral & Controle de Estoque
              </h4>
              <p className="text-zinc-400 text-xs mt-1">
                Monitore peças registradas, volumes em gôndolas e armazéns integrados.
              </p>
            </div>
            
            {/* New Product Trigger Button */}
            <button
              onClick={onOpenNewProductModal}
              className="sm:self-center px-4 py-2 bg-linear-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Item
            </button>
          </div>

          {/* Search bar and category tags */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, SKU ou cor..."
                className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 select-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-amber-400 text-black font-semibold shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable grid list of inventory items */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Nenhum produto correspondente aos filtros foi encontrado.
              </div>
            ) : (
              filteredInventory.map((item) => {
                const isLowStock = item.stock <= item.minStock;
                const progressPct = Math.min((item.stock / (item.minStock * 4)) * 100, 100);

                return (
                  <div 
                    key={item.id} 
                    className="p-3 bg-white/3 hover:bg-white/5 border border-white/4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-400 tracking-tighter">
                          {item.sku}
                        </span>
                        {isLowStock && (
                          <span className="text-[8px] font-semibold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-500/10 flex items-center gap-1 shrink-0 animate-pulse">
                            <AlertTriangle className="w-2 h-2" />
                            CRÍTICO
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-400 mt-1.5">
                        <span>Categoria: <strong className="text-zinc-200">{item.category}</strong></span>
                        <span className="text-zinc-600">|</span>
                        <span>Cor: <strong className="text-zinc-200">{item.color}</strong></span>
                        <span className="text-zinc-600">|</span>
                        <span>Preço: <strong className="text-emerald-400 font-mono">R$ {item.price.toFixed(2)}</strong></span>
                        {item.size !== 'Único' && (
                          <>
                            <span className="text-zinc-600">|</span>
                            <span>Tam: <strong className="text-amber-400 font-mono">{item.size}</strong></span>
                          </>
                        )}
                      </div>

                      {/* Stock status slider */}
                      <div className="mt-2.5 flex items-center gap-2 max-w-sm">
                        <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${progressPct}%` }} 
                            className={`h-full rounded-full ${isLowStock ? 'bg-linear-to-r from-red-500 to-amber-500' : 'bg-linear-to-r from-amber-400 to-emerald-400'}`} 
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {item.stock} un de {item.minStock} min
                        </span>
                      </div>
                    </div>

                    {/* Stock action controllers */}
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onAddStock(item.id, 10)}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-zinc-300 font-semibold rounded-xl text-[10px] flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                        title="Reabastecer com +10 unidades"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        Repor (+10)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Stock Metrics & Auto-procurement Details */}
      <div className="glass-card p-5 border border-white/5 rounded-3xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
            Sugestão de Compras Inteligente
          </h4>
          
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/2 border border-white/4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-white">Alerta Geral de Ruptura</span>
                <span className="text-[10px] font-mono text-red-400 font-semibold uppercase">Urgente</span>
              </div>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                Detectamos <strong className="text-zinc-200">3 produtos</strong> abaixo da reserva de segurança mínima nesta filial. Sugerimos acionar reposição imediata junto ao CD Central.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">Produtos Aguardando Pedido:</span>
              {[
                { name: 'Sapatilha Loafer Minimal Soft', code: 'PROD-01', missing: 10, priority: 'Alta' },
                { name: 'Óculos Escuros Retro', code: 'PROD-02', missing: 20, priority: 'Alta' },
                { name: 'T-Shirt Algodão Egípcio', code: 'PROD-06', missing: 15, priority: 'Média' },
              ].map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2 bg-black/15 rounded-xl border border-white/3 font-mono">
                  <div className="truncate max-w-[130px]">
                    <span className="text-white block truncate text-[11px] font-sans font-medium">{p.name}</span>
                    <span className="text-[9px] text-zinc-500">Pedir: {p.missing} un</span>
                  </div>
                  <span className={`text-[9px] font-sans font-semibold px-2 py-0.5 rounded ${
                    p.priority === 'Alta' ? 'bg-red-400/10 text-red-400' : 'bg-amber-400/10 text-amber-400'
                  }`}>
                    {p.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-4">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mb-2">
            <span>Última contagem cíclica:</span>
            <span className="text-white">Hoje, 07:45 por RFID</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
            <span>Sincronização ERP Omnichannel:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE / ATIVO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. EXCHANGE REASONS & CUSTOMER EXPERIENCE ANALYSIS
export function ReturnsAnalysisView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="glass-card p-5 border border-white/5 rounded-3xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-450" />
            Análise de Devoluções & Experiência do Cliente
          </h4>
          <p className="text-zinc-300 text-xs leading-relaxed mt-3">
            O índice total de trocas registrou <strong className="text-white">2.1%</strong> no fechamento parcial. A principal justificativa levantada pelo CRM continua associada à disparidade de tamanhos em compras no site/WhatsApp, seguida por variações estéticas de tom de cor do tecido.
          </p>
          <div className="mt-5 p-3.5 rounded-2xl bg-white/3 border border-white/5 flex justify-between items-center text-xs">
            <div>
              <span className="text-zinc-500 font-mono text-[9px] uppercase block">Resolução de Impasse</span>
              <span className="font-semibold text-white">Liberação automática de vale-trocas</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">97% aprovação</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-5">
          <div className="p-3 bg-black/20 rounded-xl text-center">
            <div className="text-[11px] font-mono text-zinc-500 uppercase">Tempo de Processamento</div>
            <div className="text-base font-bold text-white mt-1">4.2 min</div>
          </div>
          <div className="p-3 bg-black/20 rounded-xl text-center">
            <div className="text-[11px] font-mono text-zinc-500 uppercase">Ajuste de Bainha VIP</div>
            <div className="text-base font-bold text-amber-400 mt-1">Apenas 24h</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Principais Motivações de Trocas</h4>
        <div className="space-y-3.5 mt-2">
          {[
            { tag: 'Tamanho Inadequado (Ficou Apertado / Largo)', pct: 56, count: '184 pçs', color: 'bg-rose-500' },
            { tag: 'Divergência de Cor / Não gostou do caimento', pct: 23, count: '75 pçs', color: 'bg-amber-400' },
            { tag: 'Avaria no Produto (Zíper engatado / Botão frouxo)', pct: 12, count: '39 pçs', color: 'bg-zinc-500' },
            { tag: 'Arrependimento de Compra / Outros', pct: 9, count: '30 pçs', color: 'bg-zinc-600' },
          ].map((defect, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 text-[11px] font-sans truncate pr-4">{defect.tag}</span>
                <span className="text-zinc-400 font-semibold shrink-0 text-[11.5px]">{defect.count} ({defect.pct}%)</span>
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

// 3. LOGISTICS DISPATCH & DELIVERIES MONITOR
export function DeliveryAnalysisView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="glass-card p-5 border border-white/5 rounded-3xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Controle de Envio & Despacho Omnichannel
          </h4>
          <p className="text-zinc-300 text-xs leading-relaxed mt-3">
            O cumprimento geral do prazo de entrega para compras assistidas e site estabeleceu-se em <strong className="text-emerald-400">98.5%</strong>. A sincronização automática com Correios (Sedex Inteligente) e Motoboy agiliza o tempo médio de entrega (mínimo de 3.5 horas na capital).
          </p>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-4 mt-6">
          <span className="text-zinc-500">Adesão Total de Expedição:</span>
          <span className="text-emerald-400 font-bold">DENTRO DOS CONSTRANGIMENTOS (SLA 99%)</span>
        </div>
      </div>

      <div className="glass-card p-5 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Monitor de Expedição de Pedidos Recentes</h4>
        <div className="space-y-2.5">
          {[
            { id: 'PED-45192', channel: 'São Paulo E-commerce (Sedex)', progress: 100, status: 'Despachado' },
            { id: 'PED-45195', channel: 'Retirada Click & Collect (Ipanema)', progress: 100, status: 'Pronto p/ Retirada' },
            { id: 'PED-45201', channel: 'WhatsApp Concierge (Motoboy Express)', progress: 75, status: 'Em Rota de Envio' },
            { id: 'PED-45204', channel: 'Minas Gerais E-commerce (PAC)', progress: 30, status: 'Separação Física' },
          ].map((ord, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-white/3 font-mono">
              <span className="font-semibold text-white">{ord.id}</span>
              <span className="text-zinc-400 truncate max-w-[125px] font-sans text-[11px]">{ord.channel}</span>
              <span className="text-zinc-500">{ord.progress}%</span>
              <span className={`text-[10px] font-sans font-medium ${
                ord.progress === 100 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {ord.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
