import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import FreelancerProposals from '@/components/dashboard/FreelancerProposals';
import VerificationBanner from '@/lib/approval';

export default function FreelancerDashboardPage() {
  return (
    <ProtectedRoute roles={['freelancer']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <VerificationBanner />
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Freelancer Dashboard
            </h1>
            <p className="text-muted mt-1">
              Track your proposals, active jobs and earnings.
            </p>
          </header>
          <div className="mt-8">
            <FreelancerProposals />
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
