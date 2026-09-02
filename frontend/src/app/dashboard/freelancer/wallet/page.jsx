import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import WithdrawPanel from '@/components/withdraw/WithdrawPanel';

export default function FreelancerWalletPage() {
  return (
    <ProtectedRoute roles={['freelancer']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Wallet
            </h1>
            <p className="text-muted mt-1">
              Withdraw your released escrow earnings. Funds become available
              after the client releases payment.
            </p>
          </header>

          <div className="mt-8">
            <WithdrawPanel />
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
