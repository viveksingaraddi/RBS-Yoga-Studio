import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RBS Yoga Studio | The Art of Strength, Balance & Wellness',
  description:
    'RBS Yoga Studio offers premium classical Hatha Yoga, Pranayama, Meditation, and dedicated instruction led by Master Sangu (M.Sc. Yoga). Discover authentic physical strength, mindful stillness, and holistic transformation.',
  keywords: [
    'RBS Yoga Studio',
    'Master Sangu',
    'M.Sc. Yoga',
    'Hatha Yoga',
    'Pranayama',
    'Meditation',
    'Yoga Classes',
    'Online Yoga',
    'Wellness Retreat',
  ],
  authors: [{ name: 'Master Sangu' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-forest selection:text-ivory font-sans">
        {children}
      </body>
    </html>
  );
}
