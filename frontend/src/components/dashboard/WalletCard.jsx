'use client';

import { useState } from 'react';
import { Wallet, BadgeCheck, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DepositModal from '@/components/dashboard/DepositModal';
import { fmtBudget } from '@/lib/format';

export default function WalletCard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const balance = Number(user?.available_balance || 0);
  const isVerified = user?.payment_verified === true;
  const name = user?.name || 'there';

  return (
    <section className="bg-surface border border-line rounded-2xl shadow-soft p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-xl bg-brand/10 text-brand">
              <Wallet size={16} />
            </span>
            <h2 className="text-lg font-extrabold text-ink">Wallet</h2>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BadgeCheck size={12} /> Payment Verified
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            Hi {name}, top up your wallet to pay for task escrows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Deposit funds
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-bg/50 p-4">
          <p className="text-xs text-muted">Available balance</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {fmtBudget(balance)}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-bg/50 p-4">
          <p className="text-xs text-muted">How funds are used</p>
          <p className="mt-1 text-sm text-ink inline-flex items-start gap-1.5">
            <TrendingUp size={14} className="mt-0.5 text-brand shrink-0" />
            Held in escrow when you accept a proposal and released to the
            freelancer on completion.
          </p>
        </div>
      </div>

      <DepositModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
