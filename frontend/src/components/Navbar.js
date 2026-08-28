'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="brand">
        Skill<span>Swap</span>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link href="/explore">Explore</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
