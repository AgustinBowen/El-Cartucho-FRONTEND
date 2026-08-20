import React, { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CronometroReservaProps {
  expiraAt: string | null | undefined;
  onExpire?: () => void;
  onNearExpiryChange?: (isNearExpiry: boolean, isExpired: boolean) => void;
}

export const CronometroReserva: React.FC<CronometroReservaProps> = ({
  expiraAt,
  onExpire,
  onNearExpiryChange,
}) => {
  const calculateSecondsLeft = (): number => {
    if (!expiraAt) return 0;
    const expiryTime = new Date(expiraAt).getTime();
    if (isNaN(expiryTime)) return 0;
    const diff = Math.floor((expiryTime - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateSecondsLeft);
  const onExpireRef = useRef(onExpire);
  const onNearExpiryChangeRef = useRef(onNearExpiryChange);

  useEffect(() => {
    onExpireRef.current = onExpire;
    onNearExpiryChangeRef.current = onNearExpiryChange;
  });

  useEffect(() => {
    const diff = calculateSecondsLeft();
    setSecondsLeft(diff);

    if (diff <= 0) {
      onNearExpiryChangeRef.current?.(false, true);
      return;
    }

    onNearExpiryChangeRef.current?.(diff <= 60, false);

    const interval = setInterval(() => {
      const remaining = calculateSecondsLeft();
      setSecondsLeft(remaining);

      const isExpired = remaining <= 0;
      const nearExpiry = remaining <= 60 && remaining > 0;
      onNearExpiryChangeRef.current?.(nearExpiry, isExpired);

      if (isExpired) {
        clearInterval(interval);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiraAt]);

  if (!expiraAt || secondsLeft <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-error)] border border-[var(--color-error)]/40 shadow-sm">
        <Clock size={14} />
        <span>Reserva vencida (00:00)</span>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isNearExpiry = secondsLeft <= 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
        isNearExpiry
          ? "bg-[var(--color-warning)] text-white border border-[var(--color-warning)] animate-pulse"
          : "bg-[var(--color-accent)] text-[var(--color-secondary)] border border-[var(--color-secondary)]/40"
      }`}
    >
      {isNearExpiry ? <AlertTriangle size={14} /> : <Clock size={14} />}
      <span>Reserva expira en: {formattedTime}</span>
    </div>
  );
};
