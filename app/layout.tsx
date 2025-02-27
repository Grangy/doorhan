  // app/layout.tsx
  import type { Metadata } from 'next';
  import './globals.css';

  export function generateMetadata(): Metadata {
    return {
      title: 'Doorhan - автоматические ворота и системы',
      description: 'Профессиональная установка и обслуживание автоматических ворот Doorhan',
    };
  }

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html suppressHydrationWarning>
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    );
  }
