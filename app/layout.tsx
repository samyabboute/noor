import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "./lib/store";
import Nav from "./components/Nav";
import BagDrawer from "./components/BagDrawer";

const faviconSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%2316110C'/%3E%3Cpath d='M20 6 C21 15 25 19 34 20 C25 21 21 25 20 34 C19 25 15 21 6 20 C15 19 19 15 20 6 Z' fill='%23C4A05A'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonnoor.pl"),
  title: {
    default: "Maison Noor — Luksusowe daktyle premium | Światło daktyla",
    template: "%s — Maison Noor",
  },
  description:
    "Maison Noor — dom luksusu, którego dziełem jest daktyl. Ręcznie komponowane daktyle Deglet Nour premium z oaz Tozeur, szkatułki prezentowe i prezenty firmowe. Wysyłka w 24 h w całej Polsce.",
  keywords: [
    "luksusowe daktyle",
    "daktyle premium",
    "daktyle Deglet Nour",
    "ekskluzywne prezenty",
    "kosz prezentowy",
    "prezenty firmowe premium",
    "daktyle w czekoladzie",
    "Maison Noor",
  ],
  openGraph: {
    title: "Maison Noor — Światło daktyla",
    description: "Dom luksusu, którego dziełem jest daktyl.",
    locale: "pl_PL",
    type: "website",
    siteName: "Maison Noor",
  },
  icons: { icon: faviconSvg },
};

export const viewport: Viewport = {
  themeColor: "#16110C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="grain">
        <StoreProvider>
          <Nav />
          <main>{children}</main>
          <BagDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
