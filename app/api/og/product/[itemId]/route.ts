import { designTokens } from "@/config/theme";
import { productStructuredData } from "@/utils/seo";
const socialColors = designTokens.social;
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { getProductById } from "@/actions/productAction";

export const revalidate = 3600;

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function splitTitle(title: string, maxLen = 20) {
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

    // Fetch the product image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 4500,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NeverbeBot/1.0)",
        Accept: "image/*",
      },
    });

    const W = 1200;
    const H = 630;

    // Process product thumbnail: 480x480 contain
    const productThumb = await sharp(response.data)
      .resize(480, 480, {
        fit: "contain",
        background: socialColors.image,
      })
      .png()
      .toBuffer();

    const categoryText = escapeXml(
      (product.category || "SPORTSWEAR").toUpperCase(),
    );
    const rawName = product.name || "PREMIUM GEAR";
    const nameLines = splitTitle(rawName).map((l) => escapeXml(l));
    const offer = productStructuredData(product).offers;
    const priceText = offer
      ? `LKR ${Number(offer.price).toLocaleString("en-LK")}`
      : "NEVERBE SRI LANKA";

    const discountBadge =
      product.discount && product.discount > 0
        ? `<rect x="290" y="325" width="110" height="48" rx="8" fill="${socialColors.discountBg}" stroke="${socialColors.discountBorder}" stroke-width="1"/>
           <text x="306" y="356" font-family="DejaVu Sans, Arial, sans-serif" font-weight="800" font-size="14" fill="${socialColors.discountText}">SAVE ${product.discount}%</text>`
        : "";

    const titleSvg =
      nameLines.length === 1
        ? `<text x="68" y="230" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="46" fill="${designTokens.fixed["color-white"]}">${nameLines[0]}</text>`
        : `<text x="68" y="205" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="38" fill="${designTokens.fixed["color-white"]}">${nameLines[0]}</text>
           <text x="68" y="248" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="38" fill="${designTokens.fixed["color-white"]}">${nameLines[1]}</text>`;

    const svgOverlay = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Technical Corner brackets -->
      <path d="M 48 76 L 48 48 L 76 48" stroke="${socialColors.corner}" stroke-width="2" fill="none" />
      <path d="M 1124 48 L 1152 48 L 1152 76" stroke="${socialColors.corner}" stroke-width="2" fill="none" />
      <path d="M 48 554 L 48 582 L 76 582" stroke="${socialColors.corner}" stroke-width="2" fill="none" />
      <path d="M 1124 582 L 1152 582 L 1152 554" stroke="${socialColors.corner}" stroke-width="2" fill="none" />

      <!-- Athletic velocity speed lines -->
      <polygon points="1100,-20 1126,-20 946,650 920,650" fill="${socialColors.speed}" />
      <polygon points="1146,-20 1172,-20 992,650 966,650" fill="${socialColors.speed}" />

      <!-- Product Image frame background -->
      <rect x="635" y="70" width="490" height="490" rx="18" fill="${socialColors.image}" stroke="${socialColors.frame}" stroke-width="1.5" />

      <!-- Brand Header -->
      <text x="68" y="88" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="30" fill="${designTokens.fixed["color-white"]}" letter-spacing="-1">neverbe.</text>

      <!-- Category Pill -->
      <rect x="68" y="128" width="136" height="30" rx="15" fill="${socialColors.badge}" stroke="${socialColors.badgeBorder}" stroke-width="1" />
      <text x="82" y="148" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="11" fill="${socialColors.category}" letter-spacing="1">${categoryText}</text>

      <!-- Product Title -->
      ${titleSvg}

      <!-- Tagline -->
      <text x="68" y="285" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="15" fill="${socialColors.muted}" letter-spacing="0.5">FOOTWEAR &amp; APPAREL · SRI LANKA</text>

      <!-- Price Badge -->
      <rect x="68" y="325" width="205" height="48" rx="8" fill="${designTokens.fixed["color-white"]}" />
      <text x="82" y="357" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="22" fill="${designTokens.fixed["color-black"]}">${priceText}</text>
      ${discountBadge}

      <!-- Sportswear Perks -->
      <text x="68" y="425" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="${socialColors.subtle}">• Island-wide Tracked Delivery</text>
      <text x="68" y="453" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="${socialColors.subtle}">• Cash on Delivery Available</text>
      <text x="68" y="481" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="${socialColors.subtle}">• Explore your next everyday essential</text>

      <!-- Bottom link with arrow -->
      <text x="68" y="565" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="16" fill="${designTokens.fixed["color-white"]}">neverbe.lk</text>
      <path d="M 160 557 L 168 549 M 168 549 L 162 549 M 168 549 L 168 555" stroke="${designTokens.fixed["color-white"]}" stroke-width="2" fill="none" />
    </svg>
    `);

    const finalBuffer = await sharp({
      create: {
        width: W,
        height: H,
        channels: 4,
        background: socialColors.background,
      },
    })
      .composite([
        { input: productThumb, top: 75, left: 640 },
        { input: svgOverlay, top: 0, left: 0 },
      ])
      .jpeg({
        quality: 88,
        progressive: true,
      })
      .toBuffer();

    return new NextResponse(new Uint8Array(finalBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": finalBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("OG product image error for", itemId, error);
    return getFallback();
  }
}
