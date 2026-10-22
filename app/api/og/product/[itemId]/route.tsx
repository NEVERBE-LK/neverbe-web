import { designTokens } from "@/config/theme";
import { productStructuredData } from "@/utils/seo";
import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { getProductById } from "@/actions/productAction";

const socialColors = designTokens.social;

export const revalidate = 3600;

let fontBoldBuffer: Buffer | null = null;
let fontRegularBuffer: Buffer | null = null;

async function getFonts() {
  try {
    if (!fontBoldBuffer || !fontRegularBuffer) {
      const fontsDir = path.join(process.cwd(), "assets/fonts");
      const [bold, regular] = await Promise.all([
        fs.readFile(path.join(fontsDir, "LiberationSans-Bold.ttf")),
        fs.readFile(path.join(fontsDir, "LiberationSans-Regular.ttf")),
      ]);
      fontBoldBuffer = bold;
      fontRegularBuffer = regular;
    }
    return [
      {
        name: "LiberationSans",
        data: fontBoldBuffer,
        weight: 700 as const,
        style: "normal" as const,
      },
      {
        name: "LiberationSans",
        data: fontRegularBuffer,
        weight: 400 as const,
        style: "normal" as const,
      },
    ];
  } catch (err) {
    console.warn("Failed to load local LiberationSans fonts for OG:", err);
    return undefined;
  }
}

function splitTitle(title: string, maxLen = 22) {
  if (title.length <= maxLen) return [title];
  const words = title.split(" ");
  let line1 = "";
  let line2 = "";
  for (const w of words) {
    if ((line1 + " " + w).trim().length <= maxLen && !line2) {
      line1 = (line1 + " " + w).trim();
    } else {
      line2 = (line2 + " " + w).trim();
    }
  }
  if (!line1) return [title.slice(0, maxLen), title.slice(maxLen, maxLen * 2)];
  if (line2.length > maxLen + 6) line2 = line2.slice(0, maxLen + 3) + "...";
  return [line1, line2].filter(Boolean);
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await props.params;

  const getFallback = async () => {
    try {
      const fallbackPath = path.join(
        process.cwd(),
        "public/collections-og.png",
      );
      const buf = await fs.readFile(fallbackPath);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control":
            "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  };

  try {
    const product = await getProductById(itemId);
    if (!product) {
      return getFallback();
    }

    const imageUrl =
      product.thumbnail?.url ||
      (typeof product.thumbnail === "string" ? product.thumbnail : null) ||
      product.variants?.[0]?.images?.[0]?.url ||
      (typeof product.variants?.[0]?.images?.[0] === "string"
        ? product.variants[0].images[0]
        : null);

    if (!imageUrl) {
      return getFallback();
    }

    // Fetch the product image and convert to base64 for fast and reliable inlining
    let imageSrc = imageUrl;
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 4500,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NeverbeBot/1.0)",
          Accept: "image/*",
        },
      });
      const mime =
        response.headers["content-type"] || "image/jpeg";
      const b64 = Buffer.from(response.data).toString("base64");
      imageSrc = `data:${mime};base64,${b64}`;
    } catch (fetchErr) {
      console.warn("Failed to fetch product image buffer, falling back to direct URL", fetchErr);
    }

    const categoryText = (product.category || "SPORTSWEAR").toUpperCase();
    const rawName = product.name || "PREMIUM GEAR";
    const nameLines = splitTitle(rawName);
    const offer = productStructuredData(product).offers;
    const priceText = offer
      ? `LKR ${Number(offer.price).toLocaleString("en-LK")}`
      : "NEVERBE SRI LANKA";

    const hasDiscount = Boolean(product.discount && product.discount > 0);
    const fonts = await getFonts();

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "50px 60px",
            backgroundColor: socialColors.background,
            fontFamily: fonts ? "LiberationSans" : "sans-serif",
            position: "relative",
          }}
        >
          {/* Background SVG with technical brackets & athletic speed lines */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
            }}
            viewBox="0 0 1200 630"
          >
            <path
              d="M 48 76 L 48 48 L 76 48"
              stroke={socialColors.corner}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 1124 48 L 1152 48 L 1152 76"
              stroke={socialColors.corner}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 48 554 L 48 582 L 76 582"
              stroke={socialColors.corner}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 1124 582 L 1152 582 L 1152 554"
              stroke={socialColors.corner}
              strokeWidth="2"
              fill="none"
            />
            <polygon
              points="1100,-20 1126,-20 946,650 920,650"
              fill={socialColors.speed}
            />
            <polygon
              points="1146,-20 1172,-20 992,650 966,650"
              fill={socialColors.speed}
            />
          </svg>

          {/* Left Column: Brand & Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              width: "530px",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: designTokens.fixed["color-white"],
                  letterSpacing: "-1px",
                  marginBottom: "20px",
                }}
              >
                neverbe.
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  backgroundColor: socialColors.badge,
                  border: `1px solid ${socialColors.badgeBorder}`,
                  color: socialColors.category,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  alignSelf: "flex-start",
                  marginBottom: "20px",
                }}
              >
                {categoryText}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "8px",
                }}
              >
                {nameLines.map((line, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: nameLines.length > 1 ? "40px" : "46px",
                      fontWeight: 700,
                      color: designTokens.fixed["color-white"],
                      lineHeight: 1.15,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: socialColors.muted,
                  letterSpacing: "0.5px",
                  marginBottom: "24px",
                }}
              >
                FOOTWEAR &amp; APPAREL · SRI LANKA
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 22px",
                    borderRadius: "10px",
                    backgroundColor: designTokens.fixed["color-white"],
                    color: designTokens.fixed["color-black"],
                    fontSize: "24px",
                    fontWeight: 700,
                  }}
                >
                  {priceText}
                </div>

                {hasDiscount && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      backgroundColor: socialColors.discountBg,
                      border: `1px solid ${socialColors.discountBorder}`,
                      color: socialColors.discountText,
                      fontSize: "15px",
                      fontWeight: 700,
                    }}
                  >
                    SAVE {product.discount}%
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "14px", color: socialColors.subtle }}>
                • Island-wide Tracked Delivery
              </div>
              <div style={{ fontSize: "14px", color: socialColors.subtle }}>
                • Cash on Delivery Available
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: designTokens.fixed["color-white"],
                  fontWeight: 700,
                  marginTop: "16px",
                }}
              >
                neverbe.lk ↗
              </div>
            </div>
          </div>

          {/* Right Column: Product Image Frame */}
          <div
            style={{
              width: "500px",
              height: "500px",
              borderRadius: "24px",
              backgroundColor: socialColors.image,
              border: `1.5px solid ${socialColors.frame}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "24px",
              zIndex: 10,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts,
        headers: {
          "Cache-Control":
            "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("OG product image error for", itemId, error);
    return getFallback();
  }
}
