import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'kerjaKU Mitra - Area Ksatria',
  manifest: '/manifest-mitra.json',
  icons: {
    icon: '/icon-mitra.png',
    shortcut: '/icon-mitra.png',
    apple: '/icon-mitra.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'kerjaKU Mitra',
  },
};

export default function MitraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}