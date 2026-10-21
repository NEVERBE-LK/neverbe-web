import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { getProductById } from "@/actions/productAction";

export const dynamic = "force-dynamic";

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
  props: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await props.params;

  const getFallback = async () => {
    try {
      const fallbackPath = path.join(process.cwd(), "public/collections-og.png");
      const buf = await fs.readFile(fallbackPath);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
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
        background: { r: 20, g: 23, b: 20, alpha: 1 },
      })
      .png()
      .toBuffer();

    const categoryText = escapeXml((product.category || "SPORTSWEAR").toUpperCase());
    const rawName = product.name || "PREMIUM GEAR";
    const nameLines = splitTitle(rawName).map((l) => escapeXml(l));
    const priceText = product.sellingPrice
      ? `LKR ${product.sellingPrice.toLocaleString("en-LK")}`
      : "IN STOCK";

    const discountBadge =
      product.discount && product.discount > 0
        ? `<rect x="290" y="325" width="110" height="48" rx="8" fill="#182218" stroke="#3d573d" stroke-width="1"/>
           <text x="306" y="356" font-family="DejaVu Sans, Arial, sans-serif" font-weight="800" font-size="14" fill="#6ee7b7">SAVE ${product.discount}%</text>`
        : "";

    const titleSvg =
      nameLines.length === 1
        ? `<text x="68" y="230" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="46" fill="#ffffff">${nameLines[0]}</text>`
        : `<text x="68" y="205" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="38" fill="#ffffff">${nameLines[0]}</text>
           <text x="68" y="248" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="38" fill="#ffffff">${nameLines[1]}</text>`;

    const svgOverlay = Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Technical Corner brackets -->
      <path d="M 48 76 L 48 48 L 76 48" stroke="#333b33" stroke-width="2" fill="none" />
      <path d="M 1124 48 L 1152 48 L 1152 76" stroke="#333b33" stroke-width="2" fill="none" />
      <path d="M 48 554 L 48 582 L 76 582" stroke="#333b33" stroke-width="2" fill="none" />
      <path d="M 1124 582 L 1152 582 L 1152 554" stroke="#333b33" stroke-width="2" fill="none" />

      <!-- Athletic velocity speed lines -->
      <polygon points="1100,-20 1126,-20 946,650 920,650" fill="#151915" />
      <polygon points="1146,-20 1172,-20 992,650 966,650" fill="#151915" />

      <!-- Product Image frame background -->
      <rect x="635" y="70" width="490" height="490" rx="18" fill="#141714" stroke="#283328" stroke-width="1.5" />

      <!-- Brand Header -->
      <text x="68" y="88" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="30" fill="#ffffff" letter-spacing="-1">neverbe.</text>

      <!-- Category Pill -->
      <rect x="68" y="128" width="136" height="30" rx="15" fill="#141814" stroke="#384638" stroke-width="1" />
      <text x="82" y="148" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="11" fill="#a4b8a4" letter-spacing="1">${categoryText}</text>

      <!-- Product Title -->
      ${titleSvg}

      <!-- Tagline -->
      <text x="68" y="285" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="15" fill="#9eaba0" letter-spacing="0.5">OFFICIAL PERFORMANCE DROP · 2026</text>

      <!-- Price Badge -->
      <rect x="68" y="325" width="205" height="48" rx="8" fill="#ffffff" />
      <text x="82" y="357" font-family="DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="22" fill="#000000">${priceText}</text>
      ${discountBadge}

      <!-- Sportswear Perks -->
      <text x="68" y="425" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#8e9a8e">• Island-wide Tracked Delivery</text>
      <text x="68" y="453" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#8e9a8e">• Cash on Delivery Available</text>
      <text x="68" y="481" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#8e9a8e">• Pay in 3 with Koko (0% Interest)</text>

      <!-- Bottom link with arrow -->
      <text x="68" y="565" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="16" fill="#ffffff">neverbe.lk</text>
      <path d="M 160 557 L 168 549 M 168 549 L 162 549 M 168 549 L 168 555" stroke="#ffffff" stroke-width="2" fill="none" />
    </svg>
    `);

    const finalBuffer = await sharp({
      create: {
        width: W,
        height: H,
        channels: 4,
        background: { r: 9, g: 10, b: 9, alpha: 1 },
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
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("OG product image error for", itemId, error);
    return getFallback();
  }
}
