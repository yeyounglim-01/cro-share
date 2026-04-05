import type { Metadata } from 'next';
import { Caveat, Nunito, Noto_Serif_KR } from 'next/font/google';
import './globals.css';

const caveat = Caveat({ subsets: ['latin'], variable: '--font-sketch', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cro-share — 대바늘 패턴 메이커',
  description: '이미지 업로드 또는 직접 그리기로 전문적인 대바늘 패턴 차트를 만들어보세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${caveat.variable} ${nunito.variable} ${notoSerifKr.variable}`}>
      <body>{children}</body>
    </html>
  );
}
