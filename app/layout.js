import "./globals.css";

export const metadata = {
  title: "Tableau de bord du Maître du Jeu",
  description: "Gestion des personnages de la Taverne"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
