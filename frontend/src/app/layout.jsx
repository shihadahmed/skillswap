import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import ConditionalChrome from '@/components/ConditionalChrome';
import Toaster from '@/components/Toaster';
import Providers from '@/components/Providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'SkillSwap — Freelance Micro-Task Platform',
  description:
    'Get your tasks done by skilled freelancers. Post a task, receive proposals, hire and pay securely.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-bg text-ink h-screen flex flex-col">
        <AuthProvider>
          <Providers>
            <ConditionalChrome>{children}</ConditionalChrome>
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
