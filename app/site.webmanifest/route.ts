import { designTokens } from "@/config/theme";
export function GET() {
  return Response.json(
    {
      name: "NEVERBE",
      short_name: "NEVERBE",
      description: "Sneakers, sportswear and everyday clothing in Sri Lanka.",
      start_url: "/",
      display: "standalone",
      background_color: designTokens.dark["v2-bg-void"],
      theme_color: designTokens.dark["v2-bg-void"],
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
