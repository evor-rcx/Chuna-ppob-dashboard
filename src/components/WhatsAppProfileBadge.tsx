import React from 'react';
import { MessageCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';

type Variant = 'menu-header' | 'compact' | 'card';
type Status = 'connected' | 'connecting' | 'disconnected';

interface Props {
  variant?: Variant;
  status?: Status;
  name?: string;
  className?: string;
}

const statusConfig: Record<Status, { color: string; label: string; Icon: React.ElementType }> = {
  connected:    { color: 'text-emerald-400', label: 'Terhubung',   Icon: Wifi },
  connecting:   { color: 'text-amber-400',   label: 'Menghubungkan...', Icon: Loader2 },
  disconnected: { color: 'text-rose-400',    label: 'Terputus',    Icon: WifiOff },
};

export const WhatsAppProfileBadge: React.FC<Props> = ({
  variant = 'compact',
  status = 'connected',
  name = 'WhatsApp Bot',
  className = '',
}) => {
  const cfg = statusConfig[status];
  const { Icon } = cfg;

  const iconAnim =
    status === 'connecting'
      ? 'animate-spin'
      : status === 'connected'
      ? 'animate-pulse'
      : 'animate-bounce';

  const dotAnim =
    status === 'connected'
      ? 'animate-ping'
      : status === 'connecting'
      ? 'animate-pulse'
      : '';

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${dotAnim}`} />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <MessageCircle size={14} className={`text-emerald-400 ${iconAnim}`} />
        <span className="text-xs text-slate-300">{name}</span>
      </div>
    );
  }

  if (variant === 'menu-header') {
    return (
      <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          <div className="relative w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
            <MessageCircle size={18} className={`text-emerald-400 ${iconAnim}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-100 truncate">{name}</div>
          <div className={`flex items-center gap-1 text-xs ${cfg.color}`}>
            <Icon size={10} className={iconAnim} />
            <span>{cfg.label}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          <div className="relative w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
            <MessageCircle size={22} className={`text-emerald-400 ${iconAnim}`} />
          </div>
        </div>
        <div>
          <div className="text-base font-semibold text-slate-100">{name}</div>
          <div className={`flex items-center gap-1 text-sm ${cfg.color}`}>
            <Icon size={12} className={iconAnim} />
            <span>{cfg.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppProfileBadge;
