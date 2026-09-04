'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Routes that render the in-app dashboard chrome (sidebar) instead of the
// public marketing navbar/footer.
const APP_ROUTES = ['/dashboard', '/tasks/create', '/admin'];

function isAppRoute(pathname) {
  return APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

export default function ConditionalChrome({ children }) {
  const pathname = usePathname() || '';
  if (isAppRoute(pathname)) {
    // Dashboard area: sidebar is the navigation, no public navbar/footer.
    return <>{children}</>;
  }
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
