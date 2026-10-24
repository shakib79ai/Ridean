import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ridean — Book a ride, anywhere",
    short_name: "Ridean",
    description:
      "Ride Now, airport transfers, hourly & luxury chauffeurs, and car rentals in one installable app.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1F44",
    theme_color: "#0A1F44",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
