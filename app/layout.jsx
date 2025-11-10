import "./globals.css";

export const metadata = {
  title: "Buscador de Dominios | Branding Emoción",
  description: "Consulta la disponibilidad de dominios .com y .pe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
