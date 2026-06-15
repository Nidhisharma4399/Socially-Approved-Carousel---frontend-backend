import './globals.css';

export const metadata = {
  title: 'Socially Approved Carousel',
  description: 'Video carousel feature with inner modal, lazy loading, like/share.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
