'use client';

import { useLearn } from '@/lib/learn/store';
import { motion } from 'framer-motion';

export function RecapCarousel() {
  const { state } = useLearn();

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-learn-text">Oylik xulosa</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {state.recap.map((item, i) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`min-w-[260px] snap-start rounded-2xl bg-gradient-to-br ${item.imageGradient} p-5 text-white shadow-lg`}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">Yangilik</p>
            <h3 className="mt-2 text-lg font-bold leading-tight">{item.title}</h3>
            <p className="mt-2 text-sm opacity-90">{item.subtitle}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
