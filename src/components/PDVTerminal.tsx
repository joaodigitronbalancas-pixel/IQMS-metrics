import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Plus, Minus, Trash2, Tag, CreditCard, ChevronRight, 
  Sparkles, CheckCircle, Smartphone, AlertCircle, ShoppingBag, 
  User, Check, Receipt, Printer, RefreshCw, Layers, ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { InventoryItem, ClientProfile } from '../types';

interface PDVTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  clients: ClientProfile[];
  activeBranchName: string;
  onSuccess: (summary: {
    productId: string;
    quantity: number;
    clientId: string;
    discountPct: number;
    finalPrice: number;
    message: string;
    items: { product: InventoryItem; qty: number; discount: number; finalPrice: number }[];
    paymentDetails: { method: string; amount: number; installments?: number }[];
    operator: string;
    clientName: string;
    change: number;
    totalAmount: number;
    dateISO: string;
  }) => void;
}

interface CartItem {
  product: InventoryItem;
  quantity: number;
  itemDiscountPct: number; // custom discount percentage for this specific item
}

interface PaymentRecord {
  id: string;
  method: 'pix' | 'credit' | 'debit' | 'cash';
  amount: number;
  installments?: number; // for credit card
  status?: 'pending' | 'approved' | 'rejected';
  qrCode?: string;
  copyPastePix?: string;
}

export default function PDVTerminal({
  isOpen,
  onClose,
  inventory,
  clients,
  activeBranchName,
  onSuccess
}: PDVTerminalProps) {
  // Current step: 'cart' | 'payment' | 'processing' | 'receipt'
  const [step, setStep] = useState<'cart' | 'payment' | 'processing' | 'receipt'>('cart');
  
  // Sale States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('Mariana Alencar');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [overallDiscountPct, setOverallDiscountPct] = useState<number>(0);
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [scannerError, setScannerError] = useState<string>('');
  const [scannerFeedback, setScannerFeedback] = useState<string>('');

  // Payment States
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<'pix' | 'credit' | 'debit' | 'cash'>('pix');
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [creditInstallments, setCreditInstallments] = useState<number>(1);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

  // Processing Animation States
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);

  // Card Simulator details
  const [isLoadingGateway, setIsLoadingGateway] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCVC, setCardCVC] = useState<string>('');

  // Completed Sale Archive reference
  const [completedSale, setCompletedSale] = useState<{
    id: string;
    items: { product: InventoryItem; qty: number; discount: number; finalPrice: number }[];
    total: number;
    totalDiscount: number;
    paid: number;
    change: number;
    payments: PaymentRecord[];
    date: string;
    client: string;
    operator: string;
  } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Audio Feedback synth helper
  const playBeep = (type: 'beep' | 'success' | 'double' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration);
        };
        playTone(1000, 0, 0.08);
        playTone(1300, 0.1, 0.15);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context blocked or restricted", e);
    }
  };

  // High-fidelity active PIX polling to hear webhook notifications automatically!
  useEffect(() => {
    const pendingPayments = payments.filter(p => p.status === 'pending');
    if (pendingPayments.length === 0) return;

    const interval = setInterval(async () => {
      let updatedAny = false;
      const nextPayments = await Promise.all(
        payments.map(async (p) => {
          if (p.status === 'pending') {
            try {
              const res = await fetch(`/api/pagamentos/status/${p.id}`);
              if (res.ok) {
                const data = await res.json();
                if (data.status === 'approved') {
                  playBeep('success');
                  updatedAny = true;
                  return { ...p, status: 'approved' as const };
                }
              }
            } catch (err) {
              console.error("Error polling payment status", err);
            }
          }
          return p;
        })
      );

      if (updatedAny) {
        setPayments(nextPayments);
        setPaymentError('');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [payments]);

  // Focus barcode input on mount or step change
  useEffect(() => {
    if (isOpen && step === 'cart') {
      setTimeout(() => barcodeInputRef.current?.focus(), 300);
    }
  }, [isOpen, step]);

  // Handle SKU Scanning or entering manually
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim().toUpperCase();
    if (!query) return;

    // Find product matching SKU exactly or partially
    const product = inventory.find(p => p.sku === query || p.id === query || p.name.toUpperCase().includes(query));
    
    if (product) {
      if (product.stock <= 0) {
        playBeep('error');
        setScannerError(`🚨 Item sem estoque físico no momento: ${product.name}`);
        setScannerFeedback('');
        setTimeout(() => setScannerError(''), 4000);
      } else {
        addToCart(product);
        playBeep('beep');
        setScannerFeedback(`✨ ${product.name} adicionado ao caixa!`);
        setScannerError('');
        setTimeout(() => setScannerFeedback(''), 3000);
      }
    } else {
      playBeep('error');
      setScannerError(`❌ SKU/Código "${query}" não localizado no catálogo local.`);
      setScannerFeedback('');
      setTimeout(() => setScannerError(''), 4000);
    }
    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  };

  const addToCart = (product: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Limit checkout quantity to available stock
        if (existing.quantity >= product.stock) {
          playBeep('error');
          setScannerError(`⚠️ Limite de estoque atingido (${product.stock} un disponíveis).`);
          return prev;
        }
        playBeep('beep');
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      playBeep('beep');
      return [...prev, { product, quantity: 1, itemDiscountPct: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          // check stock limit
          if (newQty > item.product.stock) {
            setScannerError(`⚠️ Estoque indisponível. Apenas ${item.product.stock} un em estoque.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    const cappedDiscount = Math.max(0, Math.min(100, discount));
    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, itemDiscountPct: cappedDiscount }
        : item
    ));
  };

  // Math Calculations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotalDiscount = () => {
    const subtotal = getSubtotal();
    const itemDiscounts = cart.reduce((sum, item) => {
      const base = item.product.price * item.quantity;
      return sum + (base * (item.itemDiscountPct / 100));
    }, 0);
    
    const remaining = subtotal - itemDiscounts;
    const overallDiscount = remaining * (overallDiscountPct / 100);
    return itemDiscounts + overallDiscount;
  };

  const getTotalDue = () => {
    const total = getSubtotal() - getTotalDiscount();
    return Math.max(0, total);
  };

  const getRemainingAmount = () => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, getTotalDue() - totalPaid);
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getChangeDue = () => {
    const totalPaid = getTotalPaid();
    const due = getTotalDue();
    if (totalPaid > due) {
      return totalPaid - due;
    }
    return 0;
  };

  // Set default payment amount on method switch
  useEffect(() => {
    const remaining = getRemainingAmount();
    setPaymentAmountInput(remaining.toFixed(2));
  }, [currentPaymentMethod, payments, step]);

  // Handle adding payment segments (Mixed payments calling Express Backend)
  const addPaymentSegment = async () => {
    const amount = parseFloat(paymentAmountInput);
    if (isNaN(amount) || amount <= 0) {
      playBeep('error');
      setPaymentError('Por favor, informe um valor de pagamento válido.');
      return;
    }

    const remaining = getRemainingAmount();
    // Allow overpaying only for cash so we can calculate change
    if (currentPaymentMethod !== 'cash' && amount > remaining + 0.01) {
      playBeep('error');
      setPaymentError(`Pagamentos digitais não podem exceder o valor restante de R$ ${remaining.toFixed(2)}.`);
      return;
    }

    // Cash transactions processed fully locally as they are immediate physical tender
    if (currentPaymentMethod === 'cash') {
      const newPayment: PaymentRecord = {
        id: `pay-din-${Date.now()}`,
        method: 'cash',
        amount: amount,
        status: 'approved'
      };
      setPayments(prev => [...prev, newPayment]);
      setPaymentError('');
      setCashReceived('');
      playBeep('success');
      return;
    }

    // Digital transactions go through our integrated Express Gateway API
    try {
      setIsLoadingGateway(true);
      setPaymentError('');

      // Validation for CC/DC
      if (currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') {
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
          playBeep('error');
          setPaymentError('Por favor, informe um número de cartão válido.');
          setIsLoadingGateway(false);
          return;
        }
        if (!cardHolder || cardHolder.trim().length < 3) {
          playBeep('error');
          setPaymentError('Por favor, informe o nome do titular impresso no cartão.');
          setIsLoadingGateway(false);
          return;
        }
        if (!cardExpiry || !cardExpiry.includes('/')) {
          playBeep('error');
          setPaymentError('Por favor, informe a data de vencimento (MM/AA).');
          setIsLoadingGateway(false);
          return;
        }
        if (!cardCVC || cardCVC.length < 3) {
          playBeep('error');
          setPaymentError('Por favor, informe o código de segurança (CVC).');
          setIsLoadingGateway(false);
          return;
        }
      }

      const body = {
        valor: amount,
        metodo: currentPaymentMethod === 'credit' ? 'credito' : currentPaymentMethod === 'debit' ? 'debito' : 'pix',
        parcelas: currentPaymentMethod === 'credit' ? creditInstallments : 1
      };

      const res = await fetch("/api/pagamentos/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro no gateway");
      }

      if (data.status === 'rejected') {
        playBeep('error');
        setPaymentError(`Transação recusada: ${data.message || 'Verifique seus dados de cartão'}`);
        setIsLoadingGateway(false);
        return;
      }

      const newPayment: PaymentRecord = {
        id: data.id,
        method: currentPaymentMethod,
        amount: amount,
        installments: currentPaymentMethod === 'credit' ? creditInstallments : undefined,
        status: data.status,
        qrCode: data.qrCode,
        copyPastePix: data.copyPastePix
      };

      setPayments(prev => [...prev, newPayment]);
      setPaymentError('');

      // Clear card simulator fields
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCVC('');

      if (data.status === 'approved') {
        playBeep('success');
      } else {
        playBeep('beep');
        setPaymentError('📱 PIX gerado! Aguardando compensação do gateway...');
      }

    } catch (err: any) {
      console.error("[PDV Gateway error]", err);
      playBeep('error');
      setPaymentError(`Falha do terminal: ${err.message || 'Erro de conexão com gateway'}`);
    } finally {
      setIsLoadingGateway(false);
    }
  };

  // Quick cash helpers
  const handleQuickCash = (value: number) => {
    setPaymentAmountInput(value.toFixed(2));
  };

  const removePaymentSegment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // Switch to Payment reviews
  const handleGoToPayment = () => {
    if (cart.length === 0) {
      setScannerError('Seu carrinho de compras está absolutamente vazio.');
      return;
    }
    setStep('payment');
  };

  // Simulate Payment Gateway Approvals
  const handleFinalizeSale = () => {
    const totalPaid = getTotalPaid();
    const due = getTotalDue();

    if (totalPaid < due - 0.01) {
      setPaymentError(`Saldo insuficiente. Faltam pagar R$ ${(due - totalPaid).toFixed(2)}`);
      return;
    }

    const pendingCount = payments.filter(p => p.status === 'pending').length;
    if (pendingCount > 0) {
      playBeep('error');
      setPaymentError(`Aguardando a compensações de ${pendingCount} PIX pendente.`);
      return;
    }

    setStep('processing');
    setIsApproved(false);

    // Simulate authentic steps
    const statusSteps = [
      '⚡ Inicializando gateway do POS...',
      '🔗 Conectando às maquininhas do caixa...',
      '📡 Transmitindo dados seguros da transação...',
      '💳 Confirmando transações bancárias aprovadas...',
      '🔒 Gravando transação fiscal no ERP...',
      '✨ Transação Autorizada com Sucesso!'
    ];

    let currentStepIdx = 0;
    setProcessingStatus(statusSteps[0]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < statusSteps.length) {
        setProcessingStatus(statusSteps[currentStepIdx]);
      } else {
        clearInterval(interval);
        executeActualPOSCompletion();
      }
    }, 550);
  };

  const executeActualPOSCompletion = () => {
    // Generate static ID for receipt
    const saleId = `VEN-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    
    const clientRecord = clients.find(c => c.id === selectedClientId);
    const clientNameStr = clientRecord ? clientRecord.name : 'Cliente Avulso (Consumidor)';
    
    const salePackage = {
      id: saleId,
      items: cart.map(item => ({
        product: item.product,
        qty: item.quantity,
        discount: item.itemDiscountPct,
        finalPrice: item.product.price * item.quantity * (1 - item.itemDiscountPct / 100)
      })),
      total: getTotalDue(),
      totalDiscount: getTotalDiscount(),
      paid: getTotalPaid(),
      change: getChangeDue(),
      payments: payments,
      date: now.toLocaleString(),
      client: clientNameStr,
      operator: selectedOperator
    };

    setCompletedSale(salePackage);
    setIsApproved(true);
    setStep('receipt');

    // Trigger onSuccess standard reducer pipeline to update top charts, stocks, CRM, and BI
    // Feed one item at a time recursively or aggregate on state
    cart.forEach(item => {
      onSuccess({
        productId: item.product.id,
        quantity: item.quantity,
        clientId: selectedClientId || 'CNT-01', // Default client SP first if avulso
        discountPct: item.itemDiscountPct || overallDiscountPct,
        finalPrice: item.product.price * item.quantity * (1 - (item.itemDiscountPct || overallDiscountPct) / 100),
        message: `💖 [PDV Realizado] Sincronizado ${item.quantity}x ${item.product.name} (R$ ${(item.product.price * item.quantity).toFixed(2)}) com ERP.`,
        items: cart.map(c => ({
          product: c.product,
          qty: c.quantity,
          discount: c.itemDiscountPct,
          finalPrice: c.product.price * c.quantity * (1 - c.itemDiscountPct / 100)
        })),
        paymentDetails: payments.map(p => ({
          method: p.method,
          amount: p.amount,
          installments: p.installments
        })),
        operator: selectedOperator,
        clientName: clientNameStr,
        change: getChangeDue(),
        totalAmount: getTotalDue(),
        dateISO: now.toISOString()
      });
    });

    // AUTO PRINT INITIATOR
    setTimeout(() => {
      triggerThermalBrowserPrint();
    }, 1500);
  };

  const triggerThermalBrowserPrint = () => {
    // Generate specialized print styling inside an elegant hidden frame or simply let user click standard window print trigger. 
    // We can show print preview, and call window.print()
    const printContent = document.getElementById('thermal-slip-element');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir Cupom Fiscal - Vogue</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 74mm; 
                padding: 3mm; 
                margin: 0; 
                background: #fff; 
                color: #000;
                font-size: 11px;
                line-height: 1.4;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              .double-divider { border-top: 2px dashed #000; margin: 7px 0; }
              .item-table { width: 100%; border-collapse: collapse; font-size: 10px; }
              .item-table th { text-align: left; border-bottom: 1px dashed #000; }
              .item-table td { padding: 3px 0; }
              .title { font-size: 14px; font-weight: bold; text-transform: uppercase; }
              .barcode { letter-spacing: 4px; font-size: 12px; margin: 10px 0; display: block; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCancelSale = () => {
    if (confirm('Deseja realmente cancelar este cupom de venda ativa local? Todos os itens serão descartados.')) {
      resetPOS();
    }
  };

  const resetPOS = () => {
    setCart([]);
    setPayments([]);
    setSelectedClientId('');
    setOverallDiscountPct(0);
    setStep('cart');
    setBarcodeInput('');
    setPaymentError('');
    setScannerError('');
    setCompletedSale(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
          
          {/* Backdrop screen lock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-zinc-950/95 border border-white/10 rounded-[32px] shadow-3xl overflow-hidden flex flex-col z-10 text-white"
          >
            {/* TERMINAL HEADER RAIL */}
            <div className="px-6 py-4 border-b border-white/8 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-bold text-black text-sm shadow-[0_0_10px_rgba(245,158,11,0.35)]">
                  PDV
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-widest text-white uppercase font-display">Terminal de Frente de Caixa</span>
                    <span className="text-[10px] bg-emerald-450/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold animate-pulse">Sincronizado</span>
                  </div>
                  <p className="text-[10.5px] text-zinc-400 font-mono">
                    Localização: <strong className="text-white">{activeBranchName}</strong> • Operador: <strong className="text-amber-400">@{selectedOperator}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Operator Selector */}
                <div className="relative hidden md:flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/8">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="bg-transparent text-[11px] text-zinc-200 outline-none pr-3 cursor-pointer appearance-none font-medium"
                  >
                    <option value="Mariana Alencar" className="bg-zinc-950">Esp. Mariana Alencar</option>
                    <option value="Beatriz Vasconcelos" className="bg-zinc-950">Ger. Beatriz Vasconcelos</option>
                    <option value="Rodrigo Brandão" className="bg-zinc-950">Concierge Rodrigo</option>
                    <option value="Adriana Santos" className="bg-zinc-950">Shopper Adriana</option>
                  </select>
                </div>

                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DYNAMIC SCREEN LAYOUT ACCORDING TO ACTIVE PIPELINE STEP */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
              
              {/* STEP 1: CART MANAGEMENT & ITEM SCANNER */}
              {step === 'cart' && (
                <>
                  {/* Left segment - Scanner and Products feed */}
                  <div className="flex-1 p-6 overflow-y-auto border-r border-white/5 space-y-5">
                    
                    {/* RFID/Barcode scanner input emulator */}
                    <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/2">
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-450" />
                        Leitor de Código de Barras / RFID
                      </h3>
                      
                      <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            ref={barcodeInputRef}
                            type="text"
                            placeholder="Aponte o leitor, bipe a etiqueta RFID ou digite SKU (Ex: VMS-10492)..."
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            className="w-full bg-black/45 border border-white/8 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-wide placeholder-zinc-500"
                          />
                          <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[10px] font-bold rounded-lg transition-colors font-mono cursor-pointer"
                          >
                            BIPAR [ENTER]
                          </button>
                        </div>
                      </form>

                      {/* Diagnostic/Action Feedback banner */}
                      <AnimatePresence mode="wait">
                        {scannerError && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2.5 p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10.5px] flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{scannerError}</span>
                          </motion.div>
                        )}
                        {scannerFeedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-[10.5px] flex items-center gap-1.5 font-sans"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>{scannerFeedback}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quick Catalog Touchlist - Extremely easy to tap/test products */}
                    <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Estação de Lançamento Direto (Toque para Adicionar)</span>
                        
                        {/* Micro visual search */}
                        <div className="relative w-48">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Atalhos..."
                            value={itemSearchQuery}
                            onChange={(e) => setItemSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-lg pl-7 pr-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto no-scrollbar">
                        {inventory
                          .filter(p => !itemSearchQuery || p.name.toUpperCase().includes(itemSearchQuery.toUpperCase()) || p.category.toUpperCase().includes(itemSearchQuery.toUpperCase()))
                          .map(prod => {
                            const isLow = prod.stock <= prod.minStock;
                            return (
                              <button
                                key={prod.id}
                                onClick={() => addToCart(prod)}
                                disabled={prod.stock <= 0}
                                className={`p-2 bg-white/4 hover:bg-white/8 hover:text-amber-300 border border-white/5 rounded-xl text-left transition-all flex flex-col justify-between h-[64px] group opacity-90 disabled:opacity-30 disabled:hover:bg-white/4 disabled:hover:text-white cursor-pointer`}
                              >
                                <span className="text-[10px] font-medium leading-tight truncate w-full" title={prod.name}>
                                  {prod.name}
                                </span>
                                <div className="flex justify-between items-baseline w-full mt-1.5">
                                  <span className="text-[10.5px] font-mono text-emerald-400 font-semibold">R$ {prod.price.toFixed(0)}</span>
                                  <span className={`text-[8.5px] font-mono ${isLow ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>Estoque: {prod.stock}</span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Cart list details */}
                    <div>
                      <div className="flex justify-between items-baseline mb-3 border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-amber-500" />
                          Carrinho de Compras ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
                        </h4>
                        {cart.length > 0 && (
                          <button 
                            onClick={() => setCart([])} 
                            className="text-[10.5px] text-zinc-500 hover:text-red-400 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Esvaziar Carrinho
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {cart.length === 0 ? (
                          <div className="text-center py-16 text-zinc-500 border-2 border-dashed border-white/4 rounded-2xl bg-black/15">
                            <ShoppingBag className="w-10 h-10 text-white/10 mx-auto mb-2.5" />
                            <p className="text-xs">Chame as clientes!</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Insira SKUs, bipe com o leitor RFID ou use a grade de atalhos acima para iniciar a venda.</p>
                          </div>
                        ) : (
                          cart.map(item => {
                            const rowSubtotal = item.product.price * item.quantity;
                            const rowTotal = rowSubtotal * (1 - item.itemDiscountPct / 100);

                            return (
                              <div 
                                key={item.product.id}
                                className="p-3 bg-[#111115] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white truncate max-w-[210px]">{item.product.name}</span>
                                    <span className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded uppercase">{item.product.sku}</span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-zinc-400">
                                    <span>Preço unitário: <strong className="text-white font-mono">R$ {item.product.price.toFixed(2)}</strong></span>
                                    <span className="text-zinc-600">|</span>
                                    <span>Tamanho: <strong className="text-amber-500">{item.product.size}</strong></span>
                                    {item.itemDiscountPct > 0 && (
                                      <>
                                        <span className="text-zinc-600">|</span>
                                        <span className="text-rose-400 font-semibold font-mono">-{item.itemDiscountPct}% OFF</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0 select-none">
                                  {/* Item discount input */}
                                  <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-xl px-2 py-1">
                                    <Tag className="w-3 h-3 text-rose-400" />
                                    <input
                                      type="number"
                                      min="0"
                                      max="99"
                                      placeholder="0"
                                      value={item.itemDiscountPct || ''}
                                      onChange={(e) => updateItemDiscount(item.product.id, parseInt(e.target.value) || 0)}
                                      className="w-8 bg-transparent text-[11px] text-white font-mono placeholder-zinc-600 outline-none focus:text-rose-400 text-center"
                                      title="Desconto para este item (%)"
                                    />
                                    <span className="text-[10px] text-zinc-500 font-mono">%</span>
                                  </div>

                                  {/* Edit Quantity column */}
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => updateQuantity(item.product.id, -1)}
                                      className="w-6.5 h-6.5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold font-mono text-white w-5 text-center">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.product.id, 1)}
                                      className="w-6.5 h-6.5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Subtotal output */}
                                  <div className="text-right w-24">
                                    <span className="text-xs font-bold font-mono text-emerald-400 block">R$ {rowTotal.toFixed(2)}</span>
                                    {item.itemDiscountPct > 0 && (
                                      <span className="text-[9px] line-through text-zinc-600 font-mono">R$ {rowSubtotal.toFixed(1)}</span>
                                    )}
                                  </div>

                                  {/* Delete controller */}
                                  <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Remover item da venda"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right segment - Customer and overall summary panel */}
                  <div className="w-full md:w-[350px] bg-[#0c0c10] p-6 flex flex-col justify-between shrink-0 select-none">
                    
                    <div className="space-y-5">
                      
                      {/* Associating CRM Client profile */}
                      <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-3">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Cliente Vinculada (CRM)</label>
                        
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                          <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/8 text-zinc-200 text-xs rounded-xl pl-9 pr-6 py-2.5 focus:outline-none focus:border-amber-400 cursor-pointer appearance-none"
                          >
                            <option value="">CONSUMIDOR NÃO IDENTIFICADO (AVULSO)</option>
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name} - [{c.membershipLevel}] PT: {c.points}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {selectedClientId && (() => {
                          const cls = clients.find(c => c.id === selectedClientId);
                          if (!cls) return null;
                          return (
                            <div className="p-2.5 bg-black/40 rounded-xl border border-amber-500/10 space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-400">Total Gasto:</span>
                                <span className="font-semibold text-emerald-400">R$ {cls.totalSpent.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-400">Fidelidade VIP:</span>
                                <span className="font-semibold text-amber-400 uppercase font-mono">{cls.membershipLevel}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Cumulative Total block */}
                      <div className="space-y-3 text-xs bg-black/40 p-4.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Resumo Financeiro da Venda</span>
                        
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Subtotal</span>
                          <span className="font-semibold font-mono">R$ {getSubtotal().toFixed(2)}</span>
                        </div>

                        {/* Overall Discount field */}
                        <div className="flex items-center justify-between py-1 border-y border-white/5">
                          <span className="text-[11px] text-rose-450 font-medium flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-rose-400" />
                            Desconto Adicional (%)
                          </span>
                          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-white/8">
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={overallDiscountPct || ''}
                              onChange={(e) => setOverallDiscountPct(Math.min(90, parseInt(e.target.value) || 0))}
                              className="w-8 text-right bg-transparent outline-none font-mono text-xs text-rose-400 font-bold"
                            />
                            <span className="text-zinc-400 font-mono">%</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-rose-400 text-[11px]">
                          <span>Total de Desconto</span>
                          <span className="font-mono font-medium">- R$ {getTotalDiscount().toFixed(2)}</span>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                          <span className="text-sm text-zinc-300 font-bold">TOTAL GERAL</span>
                          <span className="text-2xl font-bold font-mono text-white tracking-tight">R$ {getTotalDue().toFixed(2)}</span>
                        </div>
                      </div>

                    </div>

                    <div className="space-y-3 mt-6 border-t border-white/5 pt-4">
                      <button
                        onClick={handleGoToPayment}
                        disabled={cart.length === 0}
                        className="w-full py-3.5 bg-linear-to-r from-amber-500 to-rose-500 text-black font-extrabold text-xs rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:brightness-100 disabled:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        Ir para o Pagamento <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>

                      <button
                        onClick={handleCancelSale}
                        className="w-full py-2.5 bg-white/5 hover:bg-red-500/15 text-zinc-400 hover:text-red-400 font-bold text-[10px] rounded-xl transition-all cursor-pointer text-center"
                      >
                        Cancelar Cupom de Venda
                      </button>
                    </div>

                  </div>
                </>
              )}

              {/* STEP 2: PAYMENT SEGMENTS SELECTION (MIXED PAYMENTS ALLOWED) */}
              {step === 'payment' && (
                <>
                  {/* Left Column - Active Cart Details (Locked in Review Mode) */}
                  <div className="flex-1 p-6 overflow-y-auto border-r border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Revisão de Cupons (Edição Bloqueada)</span>
                      <button 
                        onClick={() => setStep('cart')} 
                        className="text-amber-400 text-[10.5px] hover:underline font-bold"
                      >
                        ← Voltar e ajustar itens
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div key={item.product.id} className="p-2.5 bg-white/2 rounded-xl flex justify-between items-center text-xs font-mono border border-white/3">
                          <div className="text-zinc-200">
                            <span className="font-bold text-white pr-2 font-sans">{item.product.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({item.quantity}un x R$ {item.product.price.toFixed(0)})</span>
                          </div>
                          <span className="text-emerald-450 font-bold">R$ {(item.product.price * item.quantity * (1 - item.itemDiscountPct / 100)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Overall Summary box details */}
                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 text-xs text-zinc-400 space-y-2">
                      <div className="flex justify-between">
                        <span>Faturamento Bruto</span>
                        <span className="font-semibold text-zinc-200 font-mono">R$ {getSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-rose-450">
                        <span>Descontos Promocionais</span>
                        <span className="font-mono font-medium">- R$ {getTotalDiscount().toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white">TOTAL REAL DEVIDO</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">R$ {getTotalDue().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* MIXED PAYMENT PLATFORM CONFIGUURATOR */}
                    <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 bg-white/2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Configure Pagamento Misto</h4>
                        <span className="text-[10.5px] text-zinc-500">Adicione um ou mais canais de pagamento</span>
                      </div>

                      {/* Payment switch buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'pix', label: 'PIX (Instant)', icon: Smartphone, color: 'text-sky-400' },
                          { id: 'credit', label: 'C. Crédito', icon: CreditCard, color: 'text-amber-500' },
                          { id: 'debit', label: 'C. Débito', icon: CreditCard, color: 'text-teal-400' },
                          { id: 'cash', label: 'Dinheiro', icon: ShoppingBag, color: 'text-emerald-450' },
                        ].map(method => {
                          const IconComp = method.icon;
                          const isSel = currentPaymentMethod === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setCurrentPaymentMethod(method.id as any)}
                              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                isSel
                                  ? 'bg-amber-400 border-amber-400 text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-bold'
                                  : 'bg-black/45 border-white/5 text-zinc-400 hover:bg-black/60 hover:text-white'
                              }`}
                            >
                              <IconComp className={`w-4.5 h-4.5 ${isSel ? 'text-black' : method.color}`} />
                              <span className="text-[9.5px] uppercase font-mono tracking-tighter leading-none">{method.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Payment Context Parameters Input */}
                      <div className="p-4 bg-black/45 border border-white/5 rounded-2xl space-y-4">
                        
                        {/* 1. PIX CONTEXT */}
                        {currentPaymentMethod === 'pix' && (
                          <div className="space-y-3">
                            {payments.some(p => p.method === 'pix' && p.status === 'pending') ? (
                              <div className="p-4 bg-[#0a141d] rounded-2xl border border-sky-500/25 text-center space-y-3.5">
                                <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase font-mono block">📱 PIX Gateway Criado</span>
                                {payments.filter(p => p.method === 'pix' && p.status === 'pending').map((p) => (
                                  <div key={p.id} className="flex flex-col items-center space-y-3">
                                    <div className="p-2 bg-white rounded-2xl w-44 h-44 flex items-center justify-center shadow-lg">
                                      <img src={p.qrCode} alt="PIX QR Code" className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-[11px] text-zinc-300">
                                      Código: <strong className="text-white font-mono">{p.id}</strong> • Parcela: <strong className="text-emerald-400 font-mono">R$ {p.amount.toFixed(2)}</strong>
                                    </p>
                                    <div className="flex flex-col gap-2 w-full">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(p.copyPastePix || '');
                                          playBeep('beep');
                                          alert('Código PIX Copia e Cola copiado para a área de transferência!');
                                        }}
                                        className="w-full py-1.5 bg-sky-500/10 border border-sky-400/20 hover:bg-sky-500/15 text-sky-400 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                                      >
                                        Copiar Código Copia e Cola
                                      </button>
                                      <div className="flex justify-center items-center gap-1.5 text-[10px] text-sky-400 font-mono animate-pulse">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Aguardando webhook de confirmação...</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Chave PIX e QR Code</span>
                                <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                                  O sistema gerará automaticamente um QR Code pix de <strong className="text-white font-mono">R$ {paymentAmountInput}</strong> usando a chave do titular (joao.digitronbalancas@gmail.com) para leitura do cliente.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. CARD CONTEXTS (CREDIT & DEBIT WITH HIGH-FIDELITY INPUTS AND GLOSSY CARD SIMULATOR) */}
                        {(currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Formulário de Cobrança do Cartão</span>
                              <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded uppercase font-mono">Gateway Ativo</span>
                            </div>
                            
                            {/* Virtual Card Graphic */}
                            <div className="relative w-full h-[120px] bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
                              <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full blur-xl pointer-events-none" />
                              
                              <div className="flex justify-between items-start">
                                <div className="text-[8px] font-mono text-zinc-500 tracking-widest uppercase font-bold">VOGUE PAY PREMIUM</div>
                                <CreditCard className="w-5 h-5 text-zinc-400" />
                              </div>
                              
                              <div className="text-xs font-mono text-zinc-200 tracking-widest py-1">
                                {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                              </div>
                              
                              <div className="flex justify-between items-baseline">
                                <div className="text-[9px] font-mono text-zinc-400 uppercase truncate max-w-[150px]">
                                  {cardHolder ? cardHolder.toUpperCase() : 'TITULAR DO CARTÃO'}
                                </div>
                                <div className="text-[9.5px] font-mono text-zinc-400 whitespace-nowrap">
                                  {cardExpiry ? cardExpiry : 'MM/AA'}
                                </div>
                              </div>
                            </div>

                            {/* Card Details inputs */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  placeholder="Número do Cartão (16 dígitos)"
                                  maxLength={19}
                                  value={cardNumber}
                                  onChange={(e) => {
                                    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                    setCardNumber(v);
                                  }}
                                  className="w-full bg-zinc-950 border border-white/10 hover:border-white/20 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  placeholder="Nome do Titular (Como no Cartão)"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                  className="w-full bg-zinc-950 border border-white/10 hover:border-white/20 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Validade (MM/AA)"
                                  maxLength={5}
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                    if (v.length >= 2 && !v.includes('/')) {
                                      v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                    }
                                    setCardExpiry(v);
                                  }}
                                  className="w-full bg-zinc-950 border border-white/10 hover:border-white/20 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
                                />
                              </div>
                              <div>
                                <input
                                  type="password"
                                  placeholder="CVC"
                                  maxLength={4}
                                  value={cardCVC}
                                  onChange={(e) => setCardCVC(e.target.value.replace(/[^0-9]/g, ''))}
                                  className="w-full bg-zinc-950 border border-white/10 hover:border-white/20 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
                                />
                              </div>
                            </div>

                            {/* Credit installment selector choices */}
                            {currentPaymentMethod === 'credit' && (
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-zinc-500 font-mono uppercase block">Parcelas:</label>
                                  <select
                                    value={creditInstallments}
                                    onChange={(e) => setCreditInstallments(parseInt(e.target.value) || 1)}
                                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                                  >
                                    <option value="1">1x (À Vista)</option>
                                    <option value="2">2x Sem Juros</option>
                                    <option value="3">3x Sem Juros</option>
                                    <option value="4">4x (com acréscimo 2%)</option>
                                    <option value="6">6x (com acréscimo 4%)</option>
                                    <option value="10">10x (com acréscimo 6%)</option>
                                  </select>
                                </div>
                                <div className="bg-zinc-900 border border-white/8 rounded-xl px-2.5 py-1.5 text-right font-mono text-[10px] flex flex-col justify-center">
                                  <span className="text-zinc-500 text-[8px] uppercase">Simulação Parcela:</span>
                                  {(() => {
                                    const baseAmt = parseFloat(paymentAmountInput) || 0;
                                    const rate = creditInstallments >= 10 ? 1.06 : creditInstallments >= 6 ? 1.04 : creditInstallments >= 4 ? 1.02 : 1.00;
                                    const monthly = (baseAmt * rate) / creditInstallments;
                                    return (
                                      <strong className="text-white text-xs block leading-tight">
                                        {creditInstallments}x R$ {monthly.toFixed(2)}
                                      </strong>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. CASH RECEIVED CONTEXT (CHANGE AUTOMATIC CALCULATOR) */}
                        {currentPaymentMethod === 'cash' && (
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Calculadora de Troco Automática</span>
                            
                            {/* Suggest fast values helpers */}
                            <div className="flex flex-wrap gap-1.5 select-none font-mono">
                              {[50, 100, 200].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleQuickCash(val)}
                                  className="px-2 py-1 bg-white/5 hover:bg-white/12 text-zinc-350 font-bold border border-white/6 rounded-lg text-[9.5px] cursor-pointer"
                                >
                                  R$ {val}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleQuickCash(getRemainingAmount())}
                                className="px-2.5 py-1 bg-amber-450/15 border border-amber-500/20 text-amber-400 font-bold rounded-lg text-[9.5px] cursor-pointer"
                              >
                                Valor Exato (R$ {getRemainingAmount().toFixed(2)})
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9.5px] text-zinc-500 block mb-1">Valor Fornecido em Espécie</label>
                                <input
                                  type="number"
                                  placeholder="Digite quanto o cliente deu..."
                                  value={paymentAmountInput}
                                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                                  className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-450 font-mono font-bold"
                                />
                              </div>

                              <div className="bg-[#121b14] border border-emerald-500/25 p-2 rounded-xl flex flex-col justify-center text-right text-xs">
                                <span className="text-[9px] text-zinc-400 font-mono block">Troco automático a devolver:</span>
                                {(() => {
                                  const received = parseFloat(paymentAmountInput) || 0;
                                  const rem = getRemainingAmount();
                                  const change = received > rem ? (received - rem) : 0;
                                  return (
                                    <strong className="text-emerald-450 text-sm font-mono mt-0.5">R$ {change.toFixed(2)}</strong>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Flex row with amount to add */}
                        <div className="flex gap-3 items-end pt-2 border-t border-white/5">
                          {currentPaymentMethod !== 'cash' && (
                            <div className="flex-1">
                              <label className="text-[10.5px] text-zinc-450 block mb-1">Valor a Cobrar por este Meio</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono font-bold">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={paymentAmountInput}
                                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                                  className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-mono font-bold"
                                />
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={addPaymentSegment}
                            className="px-4 py-2 bg-white text-zinc-950 font-bold rounded-xl text-xs hover:bg-zinc-200 transition-all cursor-pointer whitespace-nowrap h-[32px] flex items-center justify-center self-end"
                          >
                            + Confirmar Parcela
                          </button>
                        </div>

                      </div>

                      {paymentError && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10.5px] rounded-xl flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{paymentError}</span>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Right Column - Active Payments Summary list & Submit final order */}
                  <div className="w-full md:w-[350px] bg-[#0c0c10] p-6 flex flex-col justify-between shrink-0">
                    
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Composição do Recebimento</span>
                      
                      {/* Active Payments stack list */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {payments.length === 0 ? (
                          <div className="text-center py-10 text-zinc-500 border border-dashed border-white/5 rounded-2xl">
                            <CreditCard className="w-8 h-8 text-white/5 mx-auto mb-2" />
                            <p className="text-[10.5px]">Nenhum pagamento inserido.</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">Defina os canais de recebimento à esquerda.</p>
                          </div>
                        ) : (
                          payments.map(p => (
                            <div key={p.id} className="p-3 bg-zinc-950/40 border border-white/8 rounded-xl flex justify-between items-center text-xs font-mono">
                              <div>
                                <span className="font-bold text-white uppercase text-[10.5px] tracking-tight flex items-center gap-1">
                                  {p.method === 'pix' && '📱 PIX'}
                                  {p.method === 'credit' && '💳 C. CRÉDITO'}
                                  {p.method === 'debit' && '💳 C. DÉBITO'}
                                  {p.method === 'cash' && '💵 ESPÉCIE'}
                                </span>
                                {p.installments && <span className="text-[9.5px] text-zinc-500 block">Parcelas: {p.installments}x</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <strong className="text-emerald-450">R$ {p.amount.toFixed(2)}</strong>
                                <button
                                  onClick={() => removePaymentSegment(p.id)}
                                  className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Remover parcela de pagamento"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Cumulative visual indicators */}
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Valor Total Devido:</span>
                          <span className="font-bold text-white font-mono">R$ {getTotalDue().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Pago/Recebido:</span>
                          <span className="font-bold text-emerald-400 font-mono">R$ {getTotalPaid().toFixed(2)}</span>
                        </div>
                        
                        {/* Remaining to pay indicator */}
                        <div className="pt-2 border-t border-white/8 flex justify-between items-baseline font-mono">
                          {getRemainingAmount() > 0 ? (
                            <>
                              <span className="text-[10px] text-zinc-400 uppercase font-sans font-bold">Faltam Separar</span>
                              <span className="text-sm font-bold text-amber-400">R$ {getRemainingAmount().toFixed(2)}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-zinc-400 uppercase font-sans font-bold">Troco Previsto</span>
                              <span className="text-sm font-bold text-emerald-450">R$ {getChangeDue().toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="space-y-3.5 mt-6 border-t border-white/5 pt-4">
                      {/* Gateway QR CODE simulation popup */}
                      {payments.some(p => p.method === 'pix') && (
                        <div className="p-3 bg-[#0d161a] border border-sky-500/20 rounded-2xl flex items-center gap-3">
                          <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                            {/* Simple simulated vector QR-Code visual patterns */}
                            <div className="w-full h-full bg-zinc-950 flex flex-col justify-between p-[2px]">
                              <div className="flex justify-between">
                                <div className="w-3 h-3 bg-white" />
                                <div className="w-3 h-3 bg-white" />
                              </div>
                              <div className="flex justify-between">
                                <div className="w-3 h-3 bg-white" />
                                <div className="w-1.5 h-1.5 bg-amber-400" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-sky-400 font-bold block">PIX QR Code Gerado</span>
                            <p className="text-[9.5px] text-zinc-400 italic">Celular do cliente lerá o código dinâmico gerado instantâneo no monitor.</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleFinalizeSale}
                        disabled={getRemainingAmount() > 0.01}
                        className="w-full py-4 bg-linear-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:brightness-100 disabled:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        <ShieldCheck className="w-4 h-4 text-black" />
                        Finalizar Venda & Baixar Estoque
                      </button>

                      <button
                        onClick={() => setStep('cart')}
                        className="w-full py-2 bg-transparent text-zinc-400 hover:text-white font-bold text-[10px] text-center"
                      >
                        ← Cancelar e Voltar aos Itens
                      </button>
                    </div>

                  </div>
                </>
              )}

              {/* STEP 3: TRANSACTION PROCESSING SIMULATOR SPLASH WINDOW */}
              {step === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                    {/* Animated scanning sonar ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-lg font-bold font-display uppercase tracking-widest text-white">Sincronizando com Maquininha</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed font-mono">
                      {processingStatus}
                    </p>
                  </div>

                  <div className="p-3 bg-white/3 border border-white/5 rounded-2xl w-full max-w-md font-mono text-[10px] text-zinc-500 text-left">
                    <div className="flex justify-between"><span className="text-zinc-600">ID SESSÃO:</span> <span>ST-3000-CNPJ-92812</span></div>
                    <div className="flex justify-between"><span className="text-zinc-600">OPERADOR COALITION:</span> <span>@{selectedOperator}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-600">SISTEMA INTEGRADO:</span> <span>REDE ADQUIRENTE BR COM S.A.</span></div>
                  </div>
                </div>
              )}

              {/* STEP 4: REGISTRATION RECEIPT & THERMAL COUPON GENERATOR */}
              {step === 'receipt' && completedSale && (
                <div className="flex-1 flex flex-col md:flex-row min-h-0 select-text">
                  
                  {/* Left screen view: Gorgeous success indicators and action controls */}
                  <div className="flex-1 p-8 flex flex-col justify-between items-center text-center space-y-6 overflow-y-auto">
                    
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450 mx-auto animate-bounce">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <h2 className="text-xl font-bold font-display uppercase tracking-wider text-emerald-400">Venda no Caixa Efetuada!</h2>
                        <span className="text-xs bg-white/5 border border-white/8 text-zinc-400 font-mono px-3 py-1 rounded-full uppercase">
                          CÓDIGO DE TRANSAÇÃO: #{completedSale.id}
                        </span>
                        <p className="text-[11.5px] text-zinc-400 leading-normal max-w-md mx-auto pt-2">
                          A venda foi computada e sincada no ERP. O estoque físico foi rebaixado na hora pelo sensor RFID. O cupom não fiscal abaixo foi enviado para a impressora térmica local automagicamente!
                        </p>
                      </div>
                    </div>

                    {/* Compact diagnostic card of outputs */}
                    <div className="grid grid-cols-2 gap-3.5 w-full max-w-sm">
                      <div className="p-3 bg-black/45 rounded-xl border border-white/4">
                        <span className="text-[9.5px] font-mono text-zinc-500 uppercase block">Total Recebido</span>
                        <strong className="text-sm font-mono text-white">R$ {completedSale.total.toFixed(2)}</strong>
                      </div>
                      <div className="p-3 bg-black/45 rounded-xl border border-white/4">
                        <span className="text-[9.5px] font-mono text-zinc-500 uppercase block">Troco Entregue</span>
                        <strong className="text-sm font-mono text-emerald-450">R$ {completedSale.change.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Controller Actions row */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm shrink-0">
                      <button
                        onClick={triggerThermalBrowserPrint}
                        className="flex-1 py-3 bg-white text-zinc-950 hover:bg-zinc-200 transition-colors font-extrabold text-xs uppercase cursor-pointer rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-4 h-4 text-zinc-950" />
                        Re-Imprimir Via Térmica
                      </button>

                      <button
                        onClick={resetPOS}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase cursor-pointer rounded-xl"
                      >
                        Nova Venda (Limpar)
                      </button>
                    </div>

                  </div>

                  {/* Right screen view: High resolution realistic simulated thermal 80mm receipt ticket paper roll */}
                  <div className="w-full md:w-[350px] bg-zinc-900/40 p-6 border-l border-white/5 flex flex-col items-center justify-start overflow-y-auto select-none no-scrollbar">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-3 font-bold">Simulador de Cupom Térmico (80mm)</span>
                    
                    {/* Visual paper receipt slip box */}
                    <div 
                      id="thermal-slip-element"
                      className="w-full max-w-[280px] bg-white text-black p-4 font-mono text-[10.5px] leading-tight shadow-xl flex flex-col font-mono"
                      style={{ fontFamily: "'Courier New', Courier, monospace" }}
                    >
                      <div className="text-center font-bold text-xs uppercase">
                        VOGUE & GEMS OMNICHANNEL S.A.
                      </div>
                      <div className="text-center text-[9px] mt-1">
                        AV. OSCAR FREIRE, 1045 - JARDINS - SP<br/>
                        CNPJ: 14.891.029/0001-92 - IE: ISENTO
                      </div>
                      
                      <div className="border-t border-dashed border-black my-2" />
                      
                      <div className="text-center font-bold uppercase text-[11px] py-1">
                        CUPOM DE VENDA ADQUIRENTE
                      </div>
                      
                      <div className="border-t border-dashed border-black my-2" />
                      
                      <div className="space-y-0.5 text-[9.5px]">
                        <div>DATA: {completedSale.date}</div>
                        <div>OPERADOR: {completedSale.operator}</div>
                        <div>COMPROVANTE: {completedSale.id}</div>
                        <div>NOME CLIENTE VIP: {completedSale.client}</div>
                      </div>

                      <div className="border-t border-dashed border-black my-2" />

                      {/* Header product columns */}
                      <table className="w-full text-left text-[9.5px]" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px dashed #000' }}>
                            <th style={{ padding: '2px 0' }}>PROD / SKU</th>
                            <th style={{ textAlign: 'center', padding: '2px 0' }}>QTD</th>
                            <th style={{ textAlign: 'right', padding: '2px 0' }}>VALOR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedSale.items.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '3px 0' }}>
                                <span className="font-bold">{item.product.name}</span><br/>
                                <span style={{ fontSize: '8.5px', color: '#444' }}>{item.product.sku}</span>
                              </td>
                              <td style={{ textJustify: 'center', textAlign: 'center' }}>{item.qty} un</td>
                              <td style={{ textAlign: 'right' }}>R$ {item.finalPrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="border-t border-dashed border-black my-2" />

                      <div className="space-y-0.5 text-right font-medium text-[10px]">
                        <div className="flex justify-between"><span>SUBTOTAL BRUTO</span> <span>R$ {(completedSale.total + completedSale.totalDiscount).toFixed(2)}</span></div>
                        <div className="flex justify-between" style={{ color: '#444' }}><span>DESCONTOS DE COALICÃO (-)</span> <span>R$ {completedSale.totalDiscount.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold" style={{ fontSize: '11px', borderTop: '1px solid #000', paddingTop: '3px', marginTop: '3px' }}>
                          <span>VALOR LIGADO</span> <span>R$ {completedSale.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-black my-2" />

                      <div className="space-y-0.5 text-[9px]">
                        <div className="font-bold" style={{ textDecoration: 'underline' }}>MEIOS DE RECEBIMENTO:</div>
                        {completedSale.payments.map((p, pIdx) => (
                          <div key={pIdx} className="flex justify-between">
                            <span className="uppercase">{p.method === 'pix' ? 'TELEFONE PIX' : p.method === 'cash' ? 'DINHEIRO EM ESPÉCIE' : 'CARTÃO DE CRÉDITO / DÉBITO'}</span>
                            <span className="font-bold">R$ {p.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {completedSale.change > 0 && (
                          <div className="flex justify-between font-bold" style={{ fontSize: '10px', color: '#000', borderTop: '1px dotted #000', paddingTop: '1px' }}>
                            <span>TROCO ENTREGUE EM MÃOS</span> <span>R$ {completedSale.change.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-dashed border-black my-2" />

                      <div className="text-center text-[8.5px] space-y-1.5" style={{ letterSpacing: '0.5px' }}>
                        <span className="barcode font-bold block" style={{ fontSize: '12px', letterSpacing: '4px', textDecoration: 'line-through' }}>
                          |||||  || | |||| ||||  || |
                        </span>
                        <div>CONECTIVIDADE FISCAL EFETIVADA</div>
                        <div className="font-bold">OBRIGADO PELA PREFERÊNCIA VIP!</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
