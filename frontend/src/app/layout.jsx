import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import ConditionalChrome from '@/components/ConditionalChrome';
import Toaster from '@/components/Toaster';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'SkillSwap — Freelance Micro-Task Platform',
  description:
    'Get your tasks done by skilled freelancers. Post a task, receive proposals, hire and pay securely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-bg text-ink min-h-screen flex flex-col">
        <AuthProvider>
          <ConditionalChrome>{children}</ConditionalChrome>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
