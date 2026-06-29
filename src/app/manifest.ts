import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Interior Visualization",
    short_name: "Viz MVP",
    description: "Interior visualization project workspace",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
