import React from 'react';
import { Home, Search, Bell, Mail, Bookmark, Settings, ToggleLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onMessagesClick: () => void;
  onSettingsClick: () => void;
  unreadCount: number;
}

export default function Sidebar({
  activeScreen,
  setActiveScreen,
  onSearchClick,
  onNotificationsClick,
  onMessagesClick,
  onSettingsClick,
  unreadCount,
}: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', action: () => setActiveScreen('dashboard') },
    { id: 'search', icon: Search, label: 'Consultar / Pesquisar', action: onSearchClick },
    { id: 'notifications', icon: Bell, label: 'Alertas do Sistema', action: onNotificationsClick, badge: unreadCount },
    { id: 'messages', icon: Mail, label: 'Mensagens da Planta', action: onMessagesClick },
    { id: 'bookmarks', icon: Bookmark, label: 'Visualizações Salvas', action: () => {} },
    { id: 'settings', icon: Settings, label: 'Configurações', action: onSettingsClick },
  ];

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-between py-6 w-16 h-[500px] glass-panel rounded-3xl shrink-0"
    >
      {/* Orb de inteligência ativada */}
      <div className="relative group flex items-center justify-center">
        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-neon-green/80 to-teal-400/80 flex items-center justify-center shadow-[0_0_12px_rgba(192,255,51,0.4)] transition-transform duration-300 group-hover:scale-105">
          <div className="w-3 h-3 rounded-full bg-gray-900 animate-pulse" />
        </div>
        <div className="absolute left-16 px-2.5 py-1 text-xs font-medium rounded-md glass-panel text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Sincronização Ativa IQMS
        </div>
      </div>

      {/* Navegação de Ações */}
      <div className="flex flex-col gap-5 w-full items-center">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full">
              <button
                onClick={item.action}
                className={`relative p-2.5 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/12 shadow-[0_0_8px_rgba(255,255,255,0.06)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/6'
                }`}
              >
                <IconComponent className="w-[18px] h-[18px]" />
                
                {/* Visual side accent */}
                {isActive && (
                  <motion.div
                    layoutId="activeSideBarMarker"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-neon-green shadow-[0_0_8px_rgba(192,255,51,0.8)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Marcador de notificação */}
                {!!item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-gray-900 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-16 px-2.5 py-1 text-[11px] font-medium rounded-md glass-panel text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé do Menu */}
      <div className="relative group">
        <button
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl text-gray-500 hover:text-neon-purple transition-colors cursor-pointer"
        >
          <ToggleLeft className="w-5 h-5 rotate-90" />
        </button>
        <div className="absolute left-16 px-2.5 py-1 text-[11px] font-medium rounded-md glass-panel text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Módulos Rápidos
        </div>
      </div>
    </motion.div>
  );
}
