import type { MetadataRoute } from "next";
import { empresa } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: empresa.nombre,
    short_name: "Don Pedro",
    description: empresa.descripcionCorta,
    start_url: "/",
    display: "standalone",
    background_color: "#fff8ec",
    theme_color: "#b01e2e",
    icons: [
      {
        src: "/marca/logo-harinas-pulpas-don-pedro-1915.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
