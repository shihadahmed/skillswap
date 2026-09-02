import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import WithdrawalsClient from './WithdrawalsClient';

export default function AdminWithdrawalsPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Withdrawals
            </h1>
            <p className="text-muted mt-1">
              Approve, pay out, or reject freelancer withdrawal requests.
            </p>
          </header>
          <div className="mt-8">
            <WithdrawalsClient />
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
