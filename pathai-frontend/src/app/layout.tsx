import "./globals.css";

export const metadata = {
  title: "PathAI - Geleceğin Yeteneklerini Keşfet",
  description: "Yapay zeka destekli kariyer ve proje mentörü",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}