'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="hero">
      <h1>Swap Skills. Learn Together.</h1>
      <p>
        SkillSwap connects people who want to teach what they know and learn what they
        don&apos;t. Offer a skill, request one, and grow together.
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        {user ? (
          <Link href="/explore" className="btn">
            Explore Skills
          </Link>
        ) : (
          <>
            <Link href="/register" className="btn">
              Get Started
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
