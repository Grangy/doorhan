  // app/layout.tsx
  import type { Metadata } from 'next';
  import Script from 'next/script';
  import { Providers } from './providers';

  import './globals.css';

  export function generateMetadata(): Metadata {
    return {
      title: 'Doorhan - автоматические ворота и системы в Симферополе и Крыму',
      description: 'Профессиональная установка и обслуживание автоматических ворот Doorhan. ООО "Дорхан-Крым"',
    };
  }

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html suppressHydrationWarning>
              <head>
        {/* Подключаем и инициализируем Яндекс Метрику */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){ (m[i].a=m[i].a||[]).push(arguments) };
              m[i].l=1*new Date();
              for (var j=0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k = e.createElement(t), a = e.getElementsByTagName(t)[0];
              k.async = 1;
              k.src = r;
              a.parentNode.insertBefore(k,a);
            })
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(100730665, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
            });
          `}
        </Script>
      </head>
        <body className="min-h-screen">
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }
