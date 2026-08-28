import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'SkillSwap - Exchange Skills with Others',
  description: 'A platform to swap and learn skills from people around you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
