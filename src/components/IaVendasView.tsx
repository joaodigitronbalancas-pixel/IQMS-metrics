import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Power, RefreshCw, Send, DollarSign, BarChart3, TrendingUp, 
  Users, ShoppingBag, Truck, CheckCircle2, ShieldAlert, Layers, 
  Copy, ExternalLink, Calendar, MessageSquare, AlertTriangle, Play, ChevronRight 
} from 'lucide-react';
import { InventoryItem } from '../types';

interface IaVendasViewProps {
  inventory: InventoryItem[];
  setToastMessage: (msg: string | null) => void;
  triggerReload: () => void;
}

interface Order {
  id: string;
  cliente_nome: string;
  total: number;
  status: 'Novo' | 'Processando' | 'Enviado' | 'Entregue';
  pagamento_status: 'Pendente' | 'Aprovado' | 'Recusado';
  rastreio: string;
  produtos: string;
  frete: number;
  transportadora: string;
  data: string;
}

interface Message {
  id: string;
  cliente: string;
  mensagem: string;
  resposta: string;
  data: string;
}

interface Campaign {
  id: string;
  canal: string;
  headline: string;
  texto: string;
  status: 'Ativa' | 'Pendente' | 'Pausada';
  views: number;
  clicks: number;
  conversion: number;
  produto_sugerido?: string;
  data: string;
}

interface IaStatus {
  active: boolean;
  salesTodayCount: number;
  processedOrdersCount: number;
  revenueToday: number;
  conversionRate: number;
  iaScore?: number;
  avgResponseTime?: number;
  abandonedCartsCount?: number;
  rejectionReasons?: { reason: string; count: number }[];
  bestSellingProduct?: string;
  autoLearningLog?: string[];
  approachMode?: 'consultive' | 'persuasive' | 'aggressive';
  activeCombos?: { name: string; discount: string; items: string[] }[];
}

export function IaVendasView({ inventory, setToastMessage, triggerReload }: IaVendasViewProps) {
  // 1. DATA STORES STATES
  const [status, setStatus] = useState<IaStatus>({
    active: true,
    salesTodayCount: 3,
    processedOrdersCount: 3,
    revenueToday: 1887.80,
    conversionRate: 8.4,
    iaScore: 94,
    avgResponseTime: 1.4,
    abandonedCartsCount: 12,
    rejectionReasons: [
      { reason: "Preço do frete", count: 4 },
      { reason: "Tamanho esgotado", count: 2 },
      { reason: "Indecisão / Pensar melhor", count: 6 }
    ],
    bestSellingProduct: "Vestido Midi Seda Floral (PROD-001)",
    autoLearningLog: [
      "🤖 Sofia inicializada com sucesso em modo de vendas otimizado.",
      "🎯 Aguardando interações de clientes para auto-aprendizado cognitivo."
    ],
    approachMode: 'persuasive',
    activeCombos: [
      { name: "Look Diva Completo", discount: "12% off", items: ["PROD-001", "ACC-001"] },
      { name: "Look Street Chic", discount: "10% off", items: ["PROD-002", "ACC-002"] }
    ]
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string>('');

  // 2. UI CONTROL FLOW STATES
  const [selectedClientChat, setSelectedClientChat] = useState<string>('Camila Albuquerque');
  const [clientInputMessage, setClientInputMessage] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [activeSubSection, setActiveSubSection] = useState<'dashboard' | 'chat' | 'campaigns' | 'shipping' | 'reports'>('dashboard');

  // Combo Generator Form state
  const [newComboName, setNewComboName] = useState<string>('');
  const [newComboDiscount, setNewComboDiscount] = useState<string>('15% off');
  const [newComboItems, setNewComboItems] = useState<string>('PROD-001, ACC-001');

  // Helper function to dynamically shift approach modes
  const handleChangeApproachMode = async (mode: 'consultive' | 'persuasive' | 'aggressive') => {
    try {
      const res = await fetch('/api/ia/status/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approachMode: mode })
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated);
        setToastMessage(`🧠 Sofia reconfigurada com sucesso! Tom de Conversação: [${mode.toUpperCase()}]`);
      }
    } catch {
      setToastMessage("❌ Falha de comunicação ao reconfigurar comportamento de Sofia.");
    }
  };

  // Helper function to dynamically construct custom promotional combos
  const handleCreateCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComboName.trim()) return;
    try {
      const parsedItems = newComboItems.split(',').map(i => i.trim());
      const res = await fetch('/api/ia/status/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          combos: [
            ...(status.activeCombos || []),
            { name: newComboName, discount: newComboDiscount, items: parsedItems }
          ]
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated);
        setNewComboName('');
        setToastMessage(`🎁 Combo Promocional de Luxo "[${newComboName}]" registrado e ativo para vendas.`);
      }
    } catch {
      setToastMessage("❌ Erro ao criar combo promocional no servidor de IA.");
    }
  };

  // Automated Operational AI Actions
  const handleTriggerFollowUp = async () => {
    try {
      const res = await fetch('/api/ia/status/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispararFollowUp: true })
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated);
        setToastMessage("💸 Follow-up automático disparado! Sofia recuperou 2 carrinhos abandonados com oferta Pix.");
        // Reload orders list
        const ordersRes = await fetch('/api/ia/pedidos');
        if (ordersRes.ok) {
          setOrders(await ordersRes.json());
        }
      }
    } catch {
      setToastMessage("❌ Falha de rede ao disparar follow-up automático.");
    }
  };

  const handleOtimizarEstoque = async () => {
    try {
      const res = await fetch('/api/ia/status/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otimizarParados: true })
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated);
        setToastMessage("📈 Estoque otimizado! Oferecido desconto leve de 15% off em itens parados para giro rápido.");
      }
    } catch {
      setToastMessage("❌ Erro ao enviar comando de otimização de estoque.");
    }
  };

  const handleAutoCalibrarSofia = async () => {
    try {
      const res = await fetch('/api/ia/status/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCalibration: true })
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated);
        setToastMessage("⚙️ Sofia re-calibrada! Resposta simultânea reduzida para 1.2 segundos.");
      }
    } catch {
      setToastMessage("❌ Falha na sincronização de voz e calibração de Sofia.");
    }
  };

  // Campaign Generator Controls
  const [campaignChannel, setCampaignChannel] = useState<string>('Instagram');
  const [campaignProductId, setCampaignProductId] = useState<string>(inventory[0]?.id || 'PROD-001');
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState<boolean>(false);

  // checkout/pix overlay popover
  const [showCheckoutSimDialog, setShowCheckoutSimDialog] = useState<boolean>(false);
  const [pendingSimOrder, setPendingSimOrder] = useState<{
    orderId: string;
    payId: string;
    total: number;
    qrImage: string | null;
    rawPayload: string | null;
    prodName: string;
  } | null>(null);

  // Fetch initial API datasets on screen load
  const loadAllData = async () => {
    try {
      const statusRes = await fetch('/api/ia/status');
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }

      const ordersRes = await fetch('/api/ia/pedidos');
      if (ordersRes.ok) {
        setOrders(await ordersRes.json());
      }

      const messagesRes = await fetch('/api/ia/mensagens');
      if (messagesRes.ok) {
        setMessages(await messagesRes.json());
      }

      const campaignsRes = await fetch('/api/ia/campanhas');
      if (campaignsRes.ok) {
        setCampaigns(await campaignsRes.json());
      }

      const reportRes = await fetch('/api/ia/relatorio/diario');
      if (reportRes.ok) {
        const fullReport = await reportRes.json();
        setExecutiveSummary(fullReport.analiseIA);
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados com o servidor de IA", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeSubSection]);

  // Turn AI Online/Offline
  const handleToggleIA = async () => {
    try {
      const res = await fetch('/api/ia/status/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ ...prev, active: data.active }));
        if (data.active) {
          setToastMessage("🧠 IA Sofia Vendas está ONLINE e monitorando canais online!");
        } else {
          setToastMessage("🔌 IA Sofia Vendas foi colocada em STANDBY. Atendimento offline.");
        }
      }
    } catch {
      setToastMessage("❌ Erro ao enviar comando para o servidor da IA.");
    }
  };

  // Chat message simulator handler
  const handleSendClientMessage = async (customText?: string) => {
    const textToSend = customText || clientInputMessage;
    if (!textToSend.trim()) return;

    setIsSendingMessage(true);
    setClientInputMessage('');
    
    // Optimistic user insert to visual log
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      cliente: selectedClientChat,
      mensagem: textToSend,
      resposta: 'Sofia [IA] está digitando...',
      data: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/ia/mensagens/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: selectedClientChat, mensagem: textToSend })
      });
      if (res.ok) {
        const serverReply = await res.json();
        
        // Reload raw log
        const updatedMessagesRes = await fetch('/api/ia/mensagens');
        if (updatedMessagesRes.ok) {
          const freshMsgs = await updatedMessagesRes.json();
          setMessages(freshMsgs);
        }

        // Detect dynamic billing link generation command: [LINK_GERADO] PROD-001
        if (serverReply.resposta.includes("[LINK_GERADO]")) {
          // Parse the product ID following the tag
          const words = serverReply.resposta.split("[LINK_GERADO]");
          const targetProdId = words[1]?.trim().split(" ")[0] || "PROD-001";
          
          setToastMessage("💳 Sofia IA gerou uma ordem de pagamento Pix para o cliente!");
          
          // Trigger manual checkout link generation backend simulation!
          const orderRes = await fetch('/api/ia/pedidos/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_nome: selectedClientChat,
              produto_id: targetProdId,
              quantidade: 1,
              metodo_pagamento: "pix",
              frete: 14.90,
              transportadora: "Melhor Envio (Jadlog Express)"
            })
          });

          if (orderRes.ok) {
            const checkoutData = await orderRes.json();
            const selectedItem = inventory.find(i => i.id === targetProdId) || inventory[0];
            
            // Pop open high-fidelity PIX payment gate simulator over page!
            setPendingSimOrder({
              orderId: checkoutData.order.id,
              payId: checkoutData.paymentId,
              total: checkoutData.order.total,
              qrImage: checkoutData.qrCode,
              rawPayload: checkoutData.copyPastePix,
              prodName: selectedItem ? selectedItem.name : "Coleção Elegance"
            });
            setShowCheckoutSimDialog(true);
          }
        }
      }
    } catch {
      setToastMessage("⚠️ Falha de comunicação de rede ao contatar Sofia IA.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Simulate webhook PIX approve trigger in 1-click
  const handleSimulatePaymentApproval = async () => {
    if (!pendingSimOrder) return;

    try {
      const res = await fetch('/api/pagamentos/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            id: pendingSimOrder.payId,
            status: "approved"
          },
          action: "payment.created"
        })
      });

      if (res.ok) {
        setToastMessage("✅ Webhook gateway aprovou o pagamento Pix! Ordem liberada para separação RFID.");
        setShowCheckoutSimDialog(false);
        setPendingSimOrder(null);
        triggerReload();
        loadAllData();
      }
    } catch {
      setToastMessage("✖️ Falha no simulador de pagamento.");
    }
  };

  // Generate marketing copy via Gemini API
  const handleGenerateCampaign = async () => {
    setIsGeneratingCampaign(true);
    try {
      const res = await fetch('/api/ia/campanhas/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal: campaignChannel, produtoId: campaignProductId })
      });
      if (res.ok) {
        setToastMessage("✨ Nova campanha copiada criada e revisada pela IA!");
        loadAllData();
      }
    } catch {
      setToastMessage("❌ Falha de rede ao tentar gerar copy com IA.");
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // Publish / toggle campaign status
  const handleToggleCampaignStatus = async (id: string) => {
    try {
      const res = await fetch('/api/ia/campanhas/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setToastMessage("🚀 Campanha publicada autônoma! Sofia gerará visualizações orgânicas.");
        loadAllData();
      }
    } catch {
      setToastMessage("✖️ Erro ao atualizar status da campanha.");
    }
  };

  // Force dispatch status simulation
  const handleSimulateShippingDispatch = async (id: string) => {
    try {
      const res = await fetch('/api/ia/pedidos/atualizar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'Enviado'
        })
      });
      if (res.ok) {
        setToastMessage("📦 Pedido despachado e etiqueta Melhor Envio impressa com sucesso!");
        loadAllData();
      }
    } catch {
      setToastMessage("✖️ Falha ao atualizar envio.");
    }
  };

  // Preset user quick chatbot inputs
  const clientSimulatorPresets = [
    { label: "Pedir o Vestido de Seda M", text: "Olá Sofia! Quero comprar o Vestido Midi Seda Floral no tamanho M. Qual as opções de frete?" },
    { label: "Tem Brinco de Ouro?", text: "Boa tarde, qual o preço do Brinco Argola Fita Banhado Ouro 18k? Tem em estoque?" },
    { label: "Solicitar Desconto extra", text: "Amei o colar de zircônias, mas achei um pouco caro. Você consegue algum cupom especial para mim?" },
    { label: "Finalizar Compra!", text: "Perfeito, Sofia! Adorei a jaqueta bomber de couro ecológico e vou querer fechar e pagar por Pix agora!" }
  ];

  return (
    <div className="text-white space-y-6">
      
      {/* 2x2 Header strip with AI Operator overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-medium text-sm text-white uppercase tracking-wider">Agente Autônomo de Vendas Online</h2>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase tracking-widest ${status.active ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-400/10 text-rose-450 border border-rose-500/20'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.active ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
                {status.active ? 'Ativo & Monitorando' : 'Em Standby'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">Faturamento de vendas, publicidade CRM em mídias, SAC e faturamento de fardos integrados.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadAllData} 
            className="p-2 rounded-xl bg-white/4 border border-white/10 hover:bg-white/8 transition-colors text-zinc-300 cursor-pointer text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recarregar Tudo
          </button>
          <button
            onClick={handleToggleIA}
            className={`px-4 py-2 rounded-xl font-bold font-sans text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              status.active 
                ? 'bg-rose-500/12 hover:bg-rose-500/20 text-rose-300 border border-rose-400/20' 
                : 'bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/10'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {status.active ? 'Desativar Sofia IA' : 'Ativar Sofia IA'}
          </button>
        </div>
      </div>

      {/* Internal Navigation Submenu Tabs */}
      <div className="flex border-b border-white/5 pb-2.5 overflow-x-auto select-none no-scrollbar gap-1.5">
        {[
          { id: 'dashboard', label: 'Dashboard de Indicadores', icon: BarChart3 },
          { id: 'chat', label: 'Monitor de Atendimento (Concierge Chat)', icon: MessageSquare },
          { id: 'campaigns', label: 'Anúncios & Copys de IA', icon: Layers },
          { id: 'shipping', label: 'Logística de Envios (Melhor Envio)', icon: Truck },
          { id: 'reports', label: 'Boletim Executivo (Insights)', icon: Users },
        ].map(sub => {
          const Icon = sub.icon;
          const isSelected = activeSubSection === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubSection(sub.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap ${
                isSelected 
                  ? 'bg-white/8 text-white border border-white/10' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* SUB PERSPECTIVE SCREEN: DASHBOARD */}
      {activeSubSection === 'dashboard' && (
        <div className="space-y-6">
          {/* Main stats boxes with added IA metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
              <div className="flex justify-between items-start text-zinc-400 text-[10px] font-mono tracking-wider uppercase">
                <span>Receita Online Hoje</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white mt-1.5">R$ {status.revenueToday?.toFixed(2) || '0,00'}</h3>
              <p className="text-[10px] text-emerald-400 font-sans mt-1">✓ Faturamento 100% automático</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
              <div className="flex justify-between items-start text-zinc-400 text-[10px] font-mono tracking-wider uppercase">
                <span>Conversão / Leads</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white mt-1.5">{status.conversionRate || '8.4'}%</h3>
              <p className="text-[10px] text-purple-300 font-sans mt-1">{status.salesTodayCount || '3'} vendas de {status.processedOrdersCount || '3'} conversas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
              <div className="flex justify-between items-start text-zinc-400 text-[10px] font-mono tracking-wider uppercase">
                <span>IA Score de Performance</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white mt-1.5">{status.iaScore || '94'}/100</h3>
              <p className="text-[10px] text-amber-400 font-sans mt-1">★★★★★ Execução Excelente</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
              <div className="flex justify-between items-start text-zinc-400 text-[10px] font-mono tracking-wider uppercase">
                <span>Tempo de Resposta SAC</span>
                <RefreshCw className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white mt-1.5">{status.avgResponseTime || '1.4'}s</h3>
              <p className="text-[10px] text-blue-300 font-sans mt-1">SAC Simultâneo Instantâneo ativo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1 (4 cols): AI Control Tower & Active Combos */}
            <div className="lg:col-span-5 space-y-6">
              {/* AI Strategy Config Box */}
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Abordagem Comercial Sofia
                </h3>
                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Configure o nível de agressividade comercial e os gatilhos mentais estruturais que a Sofia aplicará nos canais em tempo real:
                </p>

                <div className="grid grid-cols-3 gap-2 p-1 bg-white/3 rounded-xl border border-white/5">
                  {(['consultive', 'persuasive', 'aggressive'] as const).map((mode) => {
                    const isActive = status.approachMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => handleChangeApproachMode(mode)}
                        className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-lg'
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        {mode === 'consultive' && 'Consultivo'}
                        {mode === 'persuasive' && 'Persuasivo'}
                        {mode === 'aggressive' && 'Agressivo'}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-[10.5px] text-zinc-400 space-y-1">
                  {status.approachMode === 'consultive' && (
                    <span>💡 <strong>Modo Consultivo Amistoso:</strong> Sofia assume postura de personal stylist, realizando perguntas atentas sobre a ocasião desejada para gerar desejabilidade e criar autoridade.</span>
                  )}
                  {status.approachMode === 'persuasive' && (
                    <span>🔥 <strong>Modo Persuasivo Luxo (Recomendado):</strong> Uso intensivo de escassez limitada, prova social, combos recomendados, mimos de luxo e forte apelo de escassez comercial.</span>
                  )}
                  {status.approachMode === 'aggressive' && (
                    <span>⚡ <strong>Modo Fechamento Express:</strong> Foco absoluto na emissão imediata da cobrança Pix e conversão recorde de leads, contornando qualquer hesitação ou atraso.</span>
                  )}
                </div>
              </div>

              {/* 🤖 PILOTO AUTOMÁTICO & AUDITORIA OPERACIONAL SOFIA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 to-zinc-900 border border-purple-500/10 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    Automação Comercial Sofia IA
                  </h3>
                  <span className="text-[8px] bg-purple-500/10 text-purple-300 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">AUTO-PILOTO</span>
                </div>

                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Execute ações operacionais de marketing, reengajamento estratégico e recuperação de vendas em tempo real através de nossa equipe de IA:
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={handleTriggerFollowUp}
                    className="w-full p-3 rounded-xl bg-white/4 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 text-left text-xs transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Ativar Follow-Up Automático
                      </div>
                      <div className="text-[9.5px] text-zinc-400 leading-normal">Dispara lembretes e ofertas de 5% off para recuperar carrinhos e finalizar compras.</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>

                  <button
                    onClick={handleOtimizarEstoque}
                    className="w-full p-3 rounded-xl bg-white/4 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 text-left text-xs transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Otimizar Preços & Itens Parados
                      </div>
                      <div className="text-[9.5px] text-zinc-400 leading-normal">Avalia giro lento e executa promoções expressas no WhatsApp de forma inteligente.</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>

                  <button
                    onClick={handleAutoCalibrarSofia}
                    className="w-full p-3 rounded-xl bg-white/4 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 text-left text-xs transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Calibrar Performance de Vendas
                      </div>
                      <div className="text-[9.5px] text-zinc-400 leading-normal">Analisa o tom emocional das conversas e zera tempos e delays de resposta.</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* 🧾 SCRIPTS DE VENDAS INTERNOS (SOFIA MARKETING VOICES) */}
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-pink-400" />
                    Scripts de Conversão Sofia
                  </h3>
                  <span className="text-[8px] bg-pink-500/10 text-pink-300 px-1.5 py-0.2 rounded font-bold uppercase">ATIVO</span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Abertura Concierge Amistoso", badge: "Saudação", text: "Oi! 😊 Me conta, você está procurando algo para alguma ocasião especial?" },
                    { title: "Engajamento e Valorização", badge: "Curiosidade", text: "Esse modelo está saindo muito hoje, posso te mostrar mais fotos ou as cores dele?" },
                    { title: "Gatilhamento de Prova Social", badge: "Autoridade", text: "Esse é um dos mais vendidos da semana e o queridinho das nossas clientes VIP!" },
                    { title: "Condução e Fechamento Direto", badge: "Decisão", text: "Quer que eu já gere o link Pix de fechamento e reserve seu tamanho para despacho imediato?" },
                    { title: "Segunda Abordagem e Reengajamento", badge: "Escassez", text: "Passando para avisar que ainda tenho a última unidade de alta costura disponível na arara 👀" }
                  ].map((sc, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-bold text-zinc-200">{sc.title}</span>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono rounded bg-white/5 text-zinc-400">{sc.badge}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic">"{sc.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Combos setup Box */}
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Combos e Promoções Ativas
                  </h3>
                  <span className="text-[9px] font-mono text-amber-400">CO-MARKETING</span>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {status.activeCombos?.map((combo, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-bold text-zinc-200">{combo.name}</div>
                        <div className="text-[10px] text-zinc-450 font-mono">Itens: {combo.items.join(" + ")}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded font-mono uppercase tracking-wide">
                        {combo.discount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Micro form to construct combo in 1-click */}
                <form onSubmit={handleCreateCombo} className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block">Criar Combo Promocional de Vendas:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome do Combo"
                      value={newComboName}
                      onChange={(e) => setNewComboName(e.target.value)}
                      className="p-1 px-2.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-white placeholder-zinc-650"
                    />
                    <input
                      type="text"
                      placeholder="Desconto (Ex: 15% off)"
                      value={newComboDiscount}
                      onChange={(e) => setNewComboDiscount(e.target.value)}
                      className="p-1 px-2.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="IDs dos Itens (Ex: PROD-001, ACC-001)"
                    value={newComboItems}
                    onChange={(e) => setNewComboItems(e.target.value)}
                    className="w-full p-1.5 px-2.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold text-[10px] transition-all cursor-pointer uppercase tracking-wider"
                  >
                    + Publicar Combo Inteligente
                  </button>
                </form>
              </div>
            </div>

            {/* COLUMN 2 (7 cols): Cognitive Auto-Learning & Realtime Activity logs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cognitive Realtime Terminal console container */}
              <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-100">
                      Sofia Cognition Terminal (Auto-Aprendizado)
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 px-1.5 py-0.5 bg-white/5 rounded">Live Engine</span>
                </div>

                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Este terminal monitora em tempo real a reconfiguração comportamental, o mapeamento de estilo e a detecção de intenção cognitiva de cada lead. Interaja no chat para ver a máquina de vendas atuar:
                </p>

                <div className="p-4 rounded-xl bg-black border border-white/10 h-[195px] overflow-y-auto font-mono text-[10px] text-teal-400 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {status.autoLearningLog && status.autoLearningLog.length > 0 ? (
                    status.autoLearningLog.map((logLine, idx) => {
                      let colorClass = "text-teal-400";
                      if (logLine.includes("🔥") || logLine.includes("ALTA")) colorClass = "text-rose-400 font-bold";
                      else if (logLine.includes("💸") || logLine.includes("Barreira")) colorClass = "text-amber-400";
                      else if (logLine.includes("🎯")) colorClass = "text-indigo-400";
                      else if (logLine.includes("🤖")) colorClass = "text-zinc-450";

                      return (
                        <div key={idx} className={`leading-normal border-b border-white/2 pb-1.5 ${colorClass}`}>
                          <span className="text-zinc-650 mr-1.5">&gt;&gt;</span>
                          {logLine}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-650 italic text-center pt-8">Modo de escuta passiva aguardando logs...</div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                  <span>Grade Cognitiva: Conectado</span>
                  <span>Model: Gemini 3.5 Flash</span>
                </div>
              </div>

              {/* Losses & Abandonment BI Report dashboard panel */}
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Auditoria de Impedimentos & Perdas (BI)
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.2 rounded font-bold uppercase">
                    {status.abandonedCartsCount || 12} Abandonos / Hoje
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Progress bars horizontal for reasons */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Motivos de Hesitação de Venda:</span>
                    <div className="space-y-2">
                      {status.rejectionReasons?.map((r, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-300 font-sans">{r.reason}</span>
                            <span className="font-mono text-zinc-400 font-bold">{r.count} contatos</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.max(10, (r.count / 12) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sofia recommendation Box */}
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                    <span className="text-[10.5px] font-bold text-amber-400 block uppercase tracking-wider">💡 Insights & Recomedação de Venda:</span>
                    <p className="text-[10px] text-zinc-300 leading-normal font-sans">
                      "A maior barreira detectada hoje é o <strong>Valor de Frete / Indecisão com tamanho</strong>. Para alavancar a conversão de {status.bestSellingProduct || 'suas peças midi'}, ative agora frete grátis nacional para fechamentos pelo Pix ou configure o combo 'Look Diva' que oferece 12% off extra!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom online orders queue log block */}
          <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Pedidos Processados pela Sofia IA (Histórico)</h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">{orders.length} Pedidos de Venda</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 font-sans text-xs">Aguardando emissão do primeiro link de vendas no Chat...</div>
            ) : (
              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs hover:bg-white/5 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-200">{ord.cliente_nome}</span>
                        <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold uppercase">{ord.id}</span>
                      </div>
                      <div className="text-[10px] text-zinc-450 font-mono tracking-tight">{ord.produtos}</div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div className="space-y-1">
                        <div className="font-bold text-white font-mono">R$ {ord.total.toFixed(2)}</div>
                        <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-1 justify-end uppercase">
                          <span className={`w-1.5 h-1.5 rounded-full ${ord.pagamento_status === 'Aprovado' ? 'bg-emerald-400' : 'bg-amber-400'} mr-1`} />
                          {ord.pagamento_status}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB PERSPECTIVE SCREEN: CHAT CONCIERGE SIMULATOR */}
      {activeSubSection === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chat room customer select */}
          <div className="lg:col-span-3 p-4 rounded-2xl bg-white/2 border border-white/5 space-y-3">
            <h3 className="text-[11px] font-mono text-zinc-450 uppercase tracking-wider border-b border-white/5 pb-2">Ambientes do WhatsApp</h3>
            
            <div className="space-y-1.5">
              {[
                { name: 'Camila Albuquerque', cat: 'Roupas (Vestidos)', level: 'Black' },
                { name: 'Alessandra Vasconcellos', cat: 'Bolsas & Jóias', level: 'Premium' },
                { name: 'Mariana Drummond', cat: 'Acessórios', level: 'Gold' },
                { name: 'Juliana Pires', cat: 'Roupas (Casual)', level: 'Black' }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setSelectedClientChat(item.name)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    selectedClientChat === item.name 
                      ? 'bg-purple-500/10 border border-purple-500/20 text-white' 
                      : 'hover:bg-white/4 border border-transparent text-zinc-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{item.cat}</div>
                  </div>
                  <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-bold uppercase">{item.level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core conversation simulator */}
          <div className="lg:col-span-9 p-4 rounded-2xl bg-white/2 border border-white/5 space-y-4 flex flex-col justify-between min-h-[480px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white uppercase tracking-wider">Atendimento Autônomo WhatsApp</span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">• Cliente: {selectedClientChat}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono tracking-tight uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Sofia IA ouvindo chat
              </span>
            </div>

            {/* Chat conversation area */}
            <div className="space-y-4 p-2 overflow-y-auto max-h-[290px] flex-grow pr-1">
              {messages.filter(m => m.cliente === selectedClientChat).length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500">
                  Sem interações salvas para este contato. Inicie a conversa sugerindo algo na caixa abaixo.
                </div>
              ) : (
                messages.filter(m => m.cliente === selectedClientChat).map((msg, idx) => (
                  <div key={idx} className="space-y-2 text-xs">
                    {/* Customer Message bubble */}
                    <div className="flex justify-end">
                      <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 max-w-[80%] text-zinc-100">
                        <div className="font-semibold text-amber-400 text-[10px] mb-1">Cliente ({msg.cliente})</div>
                        <p className="leading-relaxed font-sans">{msg.mensagem}</p>
                      </div>
                    </div>

                    {/* Sofia Assistant message bubble */}
                    <div className="flex justify-start">
                      <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/15 max-w-[80%] text-zinc-150">
                        <div className="font-semibold text-purple-400 text-[10px] mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          Sofia AI Specialist
                        </div>
                        <div className="leading-relaxed font-sans space-y-1.5 whitespace-pre-line text-[11px]">
                          {msg.resposta.split('\n').map((line, lIdx) => {
                            if (line.trim().startsWith('http://') || line.trim().startsWith('https://')) {
                              const url = line.trim();
                              return (
                                <div key={lIdx} className="my-2 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-zinc-950/40 max-w-sm">
                                  <img 
                                    src={url} 
                                    alt="Catálogo Visual Sofia" 
                                    className="w-full aspect-[4/3] object-cover filter brightness-95 hover:brightness-100 transition-all duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              );
                            }
                            return <p key={lIdx}>{line}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulated Prompt inputs Preset strip */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mr-2">Simular Declaração do Cliente:</span>
                {clientSimulatorPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setClientInputMessage(preset.text);
                      setToastMessage("💡 Texto pré-setado carregado para simulação!");
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] bg-white/4 border border-white/6 text-zinc-300 hover:text-white hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Chat Send console UI */}
              <div className="flex items-center gap-3 bg-black/30 border border-white/8 rounded-2xl p-2.5">
                <input
                  type="text"
                  placeholder={`Digite aqui fingindo ser ${selectedClientChat} para testar a Sofia IA...`}
                  value={clientInputMessage}
                  onChange={e => setClientInputMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendClientMessage(); }}
                  disabled={isSendingMessage}
                  className="w-full bg-transparent text-white text-xs text-zinc-200 focus:outline-hidden disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendClientMessage()}
                  disabled={isSendingMessage}
                  className="px-3.5 py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-indigo-650 text-white font-bold text-xs hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {isSendingMessage ? 'Chamando...' : 'Enviar'}
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB PERSPECTIVE SCREEN: CAMPAIGNS GENERATOR */}
      {activeSubSection === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Generate command dashboard tool */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Criador de Anúncio e Copy com IA
              </h3>
              
              <div className="text-xs space-y-3.5">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Selecione o Canal de Veiculação</label>
                  <select
                    value={campaignChannel}
                    onChange={e => setCampaignChannel(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-2.5 py-2 focus:outline-none"
                  >
                    <option value="Instagram">Instagram (Post e Carrossel)</option>
                    <option value="WhatsApp">WhatsApp (Campanhas em Massa VIP)</option>
                    <option value="Facebook">Facebook (Anúncio de Conversão)</option>
                    <option value="Google Ads">Google Ads (Rede de Pesquisa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Peça do Catálogo Boutique em Foco</label>
                  <select
                    value={campaignProductId}
                    onChange={e => setCampaignProductId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-2.5 py-2 focus:outline-none"
                  >
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>{item.name} (R$ {item.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerateCampaign}
                    disabled={isGeneratingCampaign}
                    className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-indigo-600 font-bold hover:brightness-110 text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-white"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCampaign ? 'animate-spin' : ''}`} />
                    {isGeneratingCampaign ? 'Consultando Copywriters Gemini...' : 'Autogerar Copy de Luxo com IA'}
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign analytics metrics and listing */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Publicações Ativas & Histórico</h3>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 space-y-2.5 text-xs hover:bg-white/5 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 text-sm">{camp.headline}</span>
                          <span className={`px-1.5 py-0.2 text-[8px] font-mono rounded select-none font-bold uppercase ${camp.canal === 'Instagram' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : camp.canal === 'WhatsApp' ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>{camp.canal}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono tracking-tight mt-0.5 inline-block uppercase">Sugerido para: {camp.produto_sugerido}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[8px] font-mono rounded-full font-bold uppercase tracking-wider ${camp.status === 'Ativa' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-500/20 animate-pulse' : 'bg-amber-400/10 text-amber-300 border border-amber-500/10'}`}>{camp.status}</span>
                        <button
                          onClick={() => handleToggleCampaignStatus(camp.id)}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-zinc-450 hover:text-emerald-400" />
                        </button>
                      </div>
                    </div>

                    <p className="text-zinc-300 leading-relaxed font-sans">{camp.texto}</p>
                    
                    {camp.status === 'Ativa' && (
                      <div className="grid grid-cols-3 gap-3 pt-2.5 border-t border-white/5 text-[10px] text-zinc-400 font-mono">
                        <div>Visualizações: <strong className="text-white">{camp.views}</strong></div>
                        <div>Cliques: <strong className="text-white">{camp.clicks}</strong></div>
                        <div>Conversão Leads: <strong className="text-emerald-400">{camp.conversion}%</strong></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB PERSPECTIVE SCREEN: LOGISTICS SHIPPING */}
      {activeSubSection === 'shipping' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Hub de Logística Automatizada Integrada</h3>
                <p className="text-[10px] text-zinc-400 leading-normal mt-0.5 font-sans">Controle de frete expresso via Melhor Envio e transportadoras registradas auto-gerado via IA.</p>
              </div>
              <span className="text-[9.5px] font-mono text-zinc-500 tracking-widest bg-zinc-800/40 border border-white/5 rounded-md px-1.5 py-0.5">MELHOR_ENVIO_API V1</span>
            </div>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500">Sem pedidos registrados para simulação logística.</div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col md:flex-row md:items-center justify-between text-xs gap-4 font-sans">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <strong className="text-sm">{ord.cliente_nome}</strong>
                        <span className="text-[9px] font-mono bg-zinc-850 px-1 py-0.2 rounded font-bold uppercase">{ord.id}</span>
                      </div>
                      <div className="text-zinc-450 text-[10px] font-mono">{ord.produtos}</div>
                      <div className="text-zinc-450 text-[10px] flex items-center gap-1">
                        <Truck className="w-3 h-3 text-zinc-500" />
                        <span>{ord.transportadora} • R$ {ord.frete.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 justify-between md:justify-end">
                      <div className="space-y-1 text-right">
                        <div>Código Rastreio: <code className="text-amber-300 font-bold bg-black/20 font-mono text-[10px] px-1 py-0.5 rounded">{ord.rastreio || 'Pendente Pagamento'}</code></div>
                        <div className="text-[9.5px] text-zinc-500 font-mono uppercase">Status Entrega: {ord.status}</div>
                      </div>

                      {ord.status === 'Processando' && ord.pagamento_status === 'Aprovado' && (
                        <button
                          onClick={() => handleSimulateShippingDispatch(ord.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 font-bold font-sans text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Simular Despacho
                        </button>
                      )}
                    </div>
                  </div>
                )))}
            </div>
          </div>
        </div>
      )}

      {/* SUB PERSPECTIVE SCREEN: EXECUTIVE BULLETINS */}
      {activeSubSection === 'reports' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Boletim de Negócios e Cognitive Intelligence IA
              </h3>
              <button 
                onClick={loadAllData} 
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                Reanalisar com Gemini
              </button>
            </div>

            <p className="text-[10.5px] text-zinc-400 font-sans leading-normal">
              Esta seção compila relatórios executivos em tempo real de lucratividade online gerados dinamicamente analisando os fluxos e pedidos processados pela Sofia AI Especialista.
            </p>

            <div className="p-4.5 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Relatório Consolidado de Sofia IA:</span>
              </div>
              
              <div className="text-zinc-200 leading-relaxed text-xs font-sans whitespace-pre-line border-l-2 border-purple-500/30 pl-4">
                {executiveSummary || 'Sincronizando faturamento e enviando comando de auditoria de negócios ao Gemini...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realtime high-fidelty QR code simulator popup */}
      <AnimatePresence>
        {showCheckoutSimDialog && pendingSimOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            
            <div className="absolute inset-0" onClick={() => { setShowCheckoutSimDialog(false); setPendingSimOrder(null); }} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 z-10 text-white text-center space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Conexão Pix Autônoma Simulado
                </div>
                <button 
                  onClick={() => { setShowCheckoutSimDialog(false); setPendingSimOrder(null); }} 
                  className="p-1 rounded-full hover:bg-white/10 text-zinc-400 text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-sans block">Cliente: {selectedClientChat}</span>
                <strong className="text-sm block text-zinc-200 leading-tight">{pendingSimOrder.prodName}</strong>
                <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">R$ {pendingSimOrder.total.toFixed(2)}</span>
              </div>

              {pendingSimOrder.qrImage && (
                <div className="p-3 bg-white rounded-2xl w-44 h-44 mx-auto flex items-center justify-center">
                  <img src={pendingSimOrder.qrImage} alt="Simulador QR Code Pix" className="w-full h-full object-contain" />
                </div>
              )}

              <p className="text-[10px] text-zinc-450 leading-normal max-w-[280px] mx-auto font-sans">
                A Sofia gerou este Pix QR Code dinamicamente via gateway. O cliente visualiza a cobrança e realiza a transferência instantaneamente.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/5">
                <button
                  onClick={handleSimulatePaymentApproval}
                  className="w-full py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  ✓ Simular Pagamento do Cliente via Pix
                </button>
                <button
                  onClick={() => { setShowCheckoutSimDialog(false); setPendingSimOrder(null); }}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancelar Simulação
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
