'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useLearn } from '@/lib/learn/store';

export function PaymentCard() {
  const { state, paySubscription } = useLearn();
  const { user } = state;
  const owes = user.subscriptionBalance < 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="gradient-payment relative overflow-hidden rounded-2xl p-5 text-white shadow-xl"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">Oylik obuna</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {user.subscriptionBalance.toLocaleString('uz-UZ')}{' '}
              <span className="text-lg font-medium">so&apos;m</span>
            </p>
          </div>
          {owes && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              To&apos;lov kerak
            </span>
          )}
        </div>
        <p className="mt-3 text-sm opacity-90">
          Keyingi to&apos;lov: {user.subscriptionDueDate}
          {user.isSubscribed ? ' · Faol' : ''}
        </p>
        <button
          type="button"
          onClick={paySubscription}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-rose-600 transition hover:bg-white/95 active:scale-[0.98]"
        >
          <CreditCard className="h-4 w-4" />
          Hozir to&apos;lash
        </button>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
    </motion.div>
  );
}
