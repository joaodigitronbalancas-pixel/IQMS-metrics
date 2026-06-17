import React from 'react';
import { motion } from 'motion/react';

interface KPICardsProps {
  branchCode: string;
  storeType: string;
  salesManager: string;
  totalCustomersCount: number;
  returnRatePercent: number;
  totalDiscountsGiven: number;
  averageTicketValue: number;
}

export default function KPICards({
  branchCode,
  storeType,
  salesManager,
  totalCustomersCount,
  returnRatePercent,
  totalDiscountsGiven,
  averageTicketValue,
}: KPICardsProps) {
  const cards = [
    { label: 'Cód. Filial', value: branchCode },
    { label: 'Gênero Canal', value: storeType },
    { label: 'Gerente VIP', value: salesManager.split(' ')[0] }, // Just first name to avoid overflow
    { label: 'Fluxo Clientes', value: totalCustomersCount.toLocaleString() },
    { label: 'Descontos Concedidos', value: `R$ ${totalDiscountsGiven.toLocaleString()}` },
    { label: 'Ticket Médio', value: `R$ ${averageTicketValue.toFixed(1)}` },
    { label: 'Trocas / Devoluções', value: `${returnRatePercent}%` },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 min-[500px]:grid-cols-4 md:grid-cols-7 gap-1.5 w-full mt-3"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={`${card.label}-${idx}`}
          variants={itemVariants}
          whileHover={{ y: -3, scale: 1.02 }}
          className="glass-card flex flex-col justify-between p-3 rounded-2xl min-h-[75px] relative overflow-hidden group border border-white/5"
        >
          {/* Subtle reflection overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <span className="text-[10px] font-sans font-semibold text-zinc-400 uppercase tracking-wider block">
            {card.label}
          </span>
          <span className="text-[14px] font-display font-semibold text-white tracking-tight mt-1 truncate" title={String(card.value)}>
            {card.value}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
