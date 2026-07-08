import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";
import { SITE_URL, empresa, contacto } from "@/lib/site";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const titulo =
  "Harinas y Pulpas Don Pedro | Harina de Plátano, Yuca y Cambur — Mérida, Venezuela";
const descripcion =
  "Harinas artesanales de plátano, yuca y cambur (Nutriban) y pulpas de fruta 100% naturales, libres de gluten y sin conservantes. Tradición desde 1915 en Mérida, Venezuela. Consulta disponibilidad y haz tu pedido.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: titulo,
    template: "%s | Harinas Don Pedro",
  },
  description: descripcion,
  applicationName: empresa.nombre,
  authors: [{ name: empresa.nombre }],
  generator: "Next.js",
  keywords: [
    "harina de plátano",
    "harina de yuca",
    "harina de cambur",
    "Nutriban",
    "harinas sin gluten",
    "harinas artesanales",
    "pulpas de fruta",
    "libre de gluten",
    "producto natural",
    "Don Pedro",
    "Mérida",
    "Ejido",
    "Venezuela",
    "harinas naturales Venezuela",
    "pulpa de mango",
    "pulpa de mora",
    "alimentos artesanales",
  ],
  category: "food",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: empresa.nombre,
    title: titulo,
    description: descripcion,
    images: [
      {
        url: "/images/productos/harinas-don-pedro-yuca-platano-cambur-trio-500g.jpg",
        width: 1200,
        height: 800,
        alt: "Harinas artesanales Don Pedro: yuca, plátano y cambur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: titulo,
    description: descripcion,
    images: [
      "/images/productos/harinas-don-pedro-yuca-platano-cambur-trio-500g.jpg",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // El favicon y el ícono de Apple se generan desde src/app/icon.png y
  // src/app/apple-icon.png (logo real de Don Pedro).
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "@id": SITE_URL,
  name: empresa.nombre,
  alternateName: "Don Pedro Harinas y Pulpas",
  slogan: empresa.eslogan,
  foundingDate: "1915",
  description: descripcion,
  url: SITE_URL,
  image: `${SITE_URL}/images/productos/harinas-don-pedro-yuca-platano-cambur-trio-500g.jpg`,
  logo: `${SITE_URL}/marca/logo-harinas-pulpas-don-pedro-1915.png`,
  email: contacto.correo,
  telephone: contacto.telefonos.map((t) => t.tel),
  priceRange: "$$",
  servesCuisine: "Harinas y pulpas artesanales",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Las Frutas, Sector El Manzano Bajo",
    addressLocality: empresa.ciudad,
    addressRegion: "Mérida",
    postalCode: empresa.zonaPostal,
    addressCountry: "VE",
  },
  sameAs: [contacto.instagramUrl],
  makesOffer: [
    "Harina de Plátano",
    "Harina de Yuca",
    "Harina de Cambur (Nutriban)",
    "Pulpas de fruta natural",
  ].map((n) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Product", name: n },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-VE" className={`${poppins.variable} ${fraunces.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
