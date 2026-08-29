import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import FreelancerProposals from '@/components/dashboard/FreelancerProposals';

export default function FreelancerMyProposalsPage() {
  return (
    <ProtectedRoute roles={['freelancer']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              My Proposals
            </h1>
            <p className="text-muted mt-1">
              Every proposal you&apos;ve submitted across the platform.
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
