import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "./lib/store";
import AuthProvider from "./components/AuthProvider";
import Nav from "./components/Nav";
import BagDrawer from "./components/BagDrawer";
import Loader from "./components/Loader";
import SmoothScroll from "./components/SmoothScroll";
import RegionPrompt from "./components/RegionPrompt";
import WelcomeGate from "./components/WelcomeGate";

const faviconSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%230A1F18'/%3E%3Cpath d='M20 6 C21 15 25 19 34 20 C25 21 21 25 20 34 C19 25 15 21 6 20 C15 19 19 15 20 6 Z' fill='%23C2A25A'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonnoor.pl"),
  title: {
    default: "Maison Noor — Luksusowe daktyle premium | Światło daktyla",
    template: "%s — Maison Noor",
  },
  description:
    "Maison Noor — dom luksusu, którego dziełem jest daktyl. Ręcznie komponowane daktyle Deglet Nour premium z algierskich oaz Tolga, szkatułki prezentowe i prezenty firmowe. Wysyłka w 24 h w całej Polsce.",
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
  icons: {
    icon: faviconSvg,
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Noor",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FCFBF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500&display=swap"
        />
        {/* First-paint gate: a dark cover is server-rendered so the homepage
            never flashes before the loader mounts. Returning visitors (and
            /admin) skip it before paint via this synchronous check. */}
        <style dangerouslySetInnerHTML={{ __html: "[data-noor-in] #noor-gate{display:none!important}" }} />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('noor.entered')||location.pathname.indexOf('/admin')===0){document.documentElement.setAttribute('data-noor-in','1')}}catch(e){}",
          }}
        />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: "#noor-gate{display:none!important}" }} />
        </noscript>
      </head>
      <body className="grain">
        <div
          id="noor-gate"
          aria-hidden
          style={{ position: "fixed", inset: 0, zIndex: 190, background: "linear-gradient(178deg,#0b241b 0%,#082019 32%,#061a14 64%,#04100a 100%)" }}
        />
        <AuthProvider>
        <StoreProvider>
          <SmoothScroll />
          <Loader />
          <Nav />
          <main>{children}</main>
          <BagDrawer />
          <RegionPrompt />
          <WelcomeGate />
        </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
