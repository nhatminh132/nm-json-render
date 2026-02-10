import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'NM Json-render',
  description: 'AI-powered UI generation with JSON specifications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
