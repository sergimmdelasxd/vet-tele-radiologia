'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  FileCheck, 
  CreditCard, 
  Clock, 
  Info,
  ExternalLink,
  X
} from 'lucide-react';
import { AppNotification, NotificationType } from '@/types';

// Função para reproduzir um som agradável de notificação via Web Audio API
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Primeiro tom (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Segundo tom harmônico (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.14, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.debug('Web Audio not allowed without user interaction yet');
  }
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar preferência de som
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vetrad_notif_sound');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    }
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('vetrad_notif_sound', String(next));
    if (next) playChime();
  };

  // Buscar notificações
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.notifications) {
        const newNotifs: AppNotification[] = data.notifications;
        const currentUnread = newNotifs.filter(n => !n.read).length;

        // Se o número de não lidas aumentou e o som está ativo, toca o alerta
        if (currentUnread > prevUnreadCount && prevUnreadCount > 0 && soundEnabled) {
          playChime();
        }

        setNotifications(newNotifs);
        setPrevUnreadCount(currentUnread);
      }
    } catch (err) {
      console.debug('Erro ao carregar notificações:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling suave a cada 20 segundos
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [prevUnreadCount, soundEnabled]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setPrevUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setPrevUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH}h`;
    return `Há ${Math.floor(diffH / 24)}d`;
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'NEW_URGENT_EXAM':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'REPORT_READY':
        return <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />;
      case 'PAYMENT_CREDITED':
        return <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'SLA_WARNING':
        return <Clock className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer flex items-center justify-center shadow-2xs active:scale-95"
        title="Central de Notificações"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-400 rounded-full animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Painel Dropdown Flutuante */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
          {/* Topo do Painel */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-teal-600" />
                Notificações
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Botão de Som */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
                title={soundEnabled ? "Som de alerta ativado" : "Som de alerta desativado"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Marcar todas como lidas */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-200/70 transition cursor-pointer"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-slate-200" />
                <span>Nenhuma notificação por enquanto</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition flex items-start gap-3 hover:bg-slate-50 relative group ${
                    !notif.read ? 'bg-teal-50/40' : 'bg-white'
                  }`}
                >
                  {/* Ícone de status */}
                  <div className="mt-0.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs truncate ${!notif.read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-1.5">
                      {notif.message}
                    </p>

                    {/* Ação ou Link Direto */}
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        <span>Abrir exame</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>

                  {/* Botão de marcar lida individual */}
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={(e) => markSingleAsRead(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
                      title="Marcar como lida"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rodapé */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400">
              Notificações e alertas sonoros atualizados em tempo real
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
