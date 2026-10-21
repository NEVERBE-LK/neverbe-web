import os
from PIL import Image, ImageDraw, ImageFont

FONT_HERO = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_WATERMARK = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def get_white_logo(height=44):
    """Load public/logo.png, make it crisp white, and resize to specified height."""
    logo = Image.open("public/logo.png").convert("RGBA")
    r, g, b, a = logo.split()
    white_logo = Image.merge("RGBA", (
        Image.new("L", logo.size, 255),
        Image.new("L", logo.size, 255),
        Image.new("L", logo.size, 255),
        a
    ))
    aspect = logo.width / logo.height
    new_w = int(height * aspect)
    return white_logo.resize((new_w, height), Image.Resampling.LANCZOS)

def draw_arrow(draw, center_x, center_y, size=9, color=(255, 255, 255)):
    """Draw a clean vector diagonal up-right arrow (avoiding missing font glyphs)."""
    s = size / 2
    # stem
    draw.line([(center_x - s, center_y + s), (center_x + s, center_y - s)], fill=color, width=2)
    # top horizontal bar
    draw.line([(center_x + s, center_y - s), (center_x + s - s * 1.1, center_y - s)], fill=color, width=2)
    # right vertical bar
    draw.line([(center_x + s, center_y - s), (center_x + s, center_y - s + s * 1.1)], fill=color, width=2)

def draw_athletic_stripes(draw, w, h, stripe_color=(20, 23, 20)):
    """Draw high-velocity angled athletic speed stripes in the background (Nike / Adidas sportswear graphic style)."""
    stripe_w = 26
    gap = 20
    start_x = w - 190
    for i in range(3):
        x = start_x + i * (stripe_w + gap)
        p1 = (x, -20)
        p2 = (x + stripe_w, -20)
        p3 = (x + stripe_w - 180, h + 20)
        p4 = (x - 180, h + 20)
        draw.polygon([p1, p2, p3, p4], fill=stripe_color)

def draw_pill(draw, box, text, font, bg_color, border_color, text_color, radius=18, with_arrow=False):
    """Draw a rounded athletic pill badge."""
    x0, y0, x1, y1 = box
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=bg_color, outline=border_color, width=1)
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    if with_arrow:
        total_w = tw + 16
        tx = x0 + (x1 - x0 - total_w) / 2
        ty = y0 + (y1 - y0 - th) / 2 - bbox[1]
        draw.text((tx, ty), text, font=font, fill=text_color)
        arrow_x = tx + tw + 10
        arrow_y = y0 + (y1 - y0) / 2
        draw_arrow(draw, arrow_x, arrow_y, size=9, color=text_color)
    else:
        tx = x0 + (x1 - x0 - tw) / 2
        ty = y0 + (y1 - y0 - th) / 2 - bbox[1]
        draw.text((tx, ty), text, font=font, fill=text_color)

def draw_corner_accents(draw, w, h, pad=48, size=24, color=(44, 48, 44)):
    """Draw subtle technical corner framing brackets."""
    draw.line([(pad, pad), (pad + size, pad)], fill=color, width=2)
    draw.line([(pad, pad), (pad, pad + size)], fill=color, width=2)
    draw.line([(w - pad - size, pad), (w - pad, pad)], fill=color, width=2)
    draw.line([(w - pad, pad), (w - pad, pad + size)], fill=color, width=2)
    draw.line([(pad, h - pad), (pad + size, h - pad)], fill=color, width=2)
    draw.line([(pad, h - pad), (pad, h - pad - size)], fill=color, width=2)
    draw.line([(w - pad - size, h - pad), (w - pad, h - pad)], fill=color, width=2)
    draw.line([(w - pad, h - pad), (w - pad, h - pad - size)], fill=color, width=2)

def draw_subtle_radial(im, center_x, center_y, max_r, color_inner, color_outer):
    """Draw subtle smooth radial illumination."""
    draw = ImageDraw.Draw(im)
    steps = 60
    for i in range(steps, 0, -1):
        r = int(max_r * (i / steps))
        factor = i / steps
        c = tuple(int(color_inner[j] * (1 - factor) + color_outer[j] * factor) for j in range(3))
        draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=c)

# -------------------------------------------------------------
# 1. MAIN HOMEPAGE OG (Nike / Adidas Sportswear Style)
# -------------------------------------------------------------
def generate_main_og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (8, 9, 8))
    draw_subtle_radial(im, 420, 280, 560, (24, 27, 24), (8, 9, 8))
    draw = ImageDraw.Draw(im)

    # Giant subtle athletic watermark in the background
    font_wm = ImageFont.truetype(FONT_WATERMARK, 210)
    draw.text((640, 160), "NEVERBE", font=font_wm, fill=(14, 17, 14))

    # Dynamic athletic speed stripes on background
    draw_athletic_stripes(draw, W, H, stripe_color=(22, 26, 22))
    draw_corner_accents(draw, W, H, pad=48, size=28, color=(44, 48, 44))

    # Top Brand Bar
    logo = get_white_logo(height=42)
    im.paste(logo, (72, 60), logo)

    font_eyebrow = ImageFont.truetype(FONT_BOLD, 12)
    draw_pill(draw, (840, 62, 1128, 98), "SRI LANKA · ATHLETIC ROTATION · 2026", font_eyebrow,
              bg_color=(18, 22, 18), border_color=(46, 54, 46), text_color=(195, 205, 195))

    # Center Athletic Headline (Heavy Impact Nike / Adidas Style)
    font_hero = ImageFont.truetype(FONT_HERO, 72)
    draw.text((72, 162), "NEVER STAND STILL.", font=font_hero, fill=(255, 255, 255))

    font_tag = ImageFont.truetype(FONT_BOLD, 20)
    draw.text((74, 264), "PERFORMANCE FOOTWEAR · APPAREL · STREETWEAR", font=font_tag, fill=(160, 172, 160))

    font_desc = ImageFont.truetype(FONT_REGULAR, 20)
    draw.text((74, 318), "Engineered for high performance, everyday movement, and athletic style.", font=font_desc, fill=(132, 140, 132))
    draw.text((74, 348), "Discover premier sneakers, running silhouettes, and apparel in Sri Lanka.", font=font_desc, fill=(132, 140, 132))

    # Divider line
    draw.line([(72, 420), (1128, 420)], fill=(32, 38, 32), width=1)

    # Bottom feature pills
    font_pill = ImageFont.truetype(FONT_BOLD, 14)
    draw_pill(draw, (72, 470, 316, 526), "ISLAND-WIDE DELIVERY", font_pill,
              bg_color=(16, 20, 16), border_color=(42, 50, 42), text_color=(235, 240, 235))
    draw_pill(draw, (334, 470, 606, 526), "CASH ON DELIVERY", font_pill,
              bg_color=(16, 20, 16), border_color=(42, 50, 42), text_color=(235, 240, 235))
    draw_pill(draw, (624, 470, 876, 526), "PAY IN 3 WITH KOKO", font_pill,
              bg_color=(16, 20, 16), border_color=(42, 50, 42), text_color=(235, 240, 235))
    draw_pill(draw, (930, 470, 1128, 526), "neverbe.lk", font_pill,
              bg_color=(28, 34, 28), border_color=(60, 72, 60), text_color=(255, 255, 255), with_arrow=True)

    im.save("public/main-og.png", format="PNG", optimize=True)
    print("Generated public/main-og.png (1200x630)")

# -------------------------------------------------------------
# 2. COLLECTIONS OG (Nike / Adidas Sportswear Style)
# -------------------------------------------------------------
def generate_collections_og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (8, 9, 8))
    draw_subtle_radial(im, 420, 280, 560, (22, 27, 22), (8, 9, 8))
    draw = ImageDraw.Draw(im)

    font_wm = ImageFont.truetype(FONT_WATERMARK, 210)
    draw.text((640, 160), "GEAR", font=font_wm, fill=(14, 18, 14))

    draw_athletic_stripes(draw, W, H, stripe_color=(20, 25, 20))
    draw_corner_accents(draw, W, H, pad=48, size=28, color=(44, 48, 44))

    logo = get_white_logo(height=42)
    im.paste(logo, (72, 60), logo)

    font_eyebrow = ImageFont.truetype(FONT_BOLD, 12)
    draw_pill(draw, (860, 62, 1128, 98), "OFFICIAL COLLECTIONS · 2026", font_eyebrow,
              bg_color=(18, 22, 18), border_color=(46, 54, 46), text_color=(190, 202, 192))

    font_hero = ImageFont.truetype(FONT_HERO, 72)
    draw.text((72, 162), "ELEVATE EVERY STRIDE.", font=font_hero, fill=(255, 255, 255))

    font_tag = ImageFont.truetype(FONT_BOLD, 20)
    draw.text((74, 264), "PERFORMANCE FOOTWEAR · SNEAKERS · ACTIVEWEAR", font=font_tag, fill=(160, 172, 160))

    font_desc = ImageFont.truetype(FONT_REGULAR, 20)
    draw.text((74, 318), "Explore the complete Neverbe active lineup: signature sneakers, running shoes,", font=font_desc, fill=(132, 140, 132))
    draw.text((74, 348), "cushioned slides, and training gear built for Sri Lankan terrain.", font=font_desc, fill=(132, 140, 132))

    draw.line([(72, 420), (1128, 420)], fill=(32, 38, 32), width=1)

    font_cat = ImageFont.truetype(FONT_BOLD, 13)
    categories = ["SNEAKERS", "RUNNING", "SLIDES & SANDALS", "APPAREL", "NEW DROPS"]
    x = 72
    for cat in categories:
        bbox = font_cat.getbbox(cat)
        w_pill = bbox[2] - bbox[0] + 36
        draw_pill(draw, (x, 470, x + w_pill, 524), cat, font_cat,
                  bg_color=(16, 22, 18), border_color=(42, 54, 44), text_color=(230, 240, 232))
        x += w_pill + 14

    draw_pill(draw, (940, 470, 1128, 524), "neverbe.lk", font_cat,
              bg_color=(28, 36, 30), border_color=(58, 72, 60), text_color=(255, 255, 255), with_arrow=True)

    im.save("public/collections-og.png", format="PNG", optimize=True)
    print("Generated public/collections-og.png (1200x630)")

# -------------------------------------------------------------
# 3. OFFERS & COMBOS OG (Nike / Adidas Sportswear Style)
# -------------------------------------------------------------
def generate_offers_og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (10, 9, 8))
    draw_subtle_radial(im, 420, 280, 560, (30, 25, 18), (10, 9, 8))
    draw = ImageDraw.Draw(im)

    font_wm = ImageFont.truetype(FONT_WATERMARK, 210)
    draw.text((640, 160), "OFFERS", font=font_wm, fill=(18, 16, 12))

    draw_athletic_stripes(draw, W, H, stripe_color=(28, 22, 18))
    draw_corner_accents(draw, W, H, pad=48, size=28, color=(54, 46, 36))

    logo = get_white_logo(height=42)
    im.paste(logo, (72, 60), logo)

    font_eyebrow = ImageFont.truetype(FONT_BOLD, 12)
    draw_pill(draw, (870, 62, 1128, 98), "EXCLUSIVE SAVINGS · 2026", font_eyebrow,
              bg_color=(24, 18, 14), border_color=(64, 48, 32), text_color=(230, 200, 150))

    font_hero = ImageFont.truetype(FONT_HERO, 72)
    draw.text((72, 162), "PUSH PAST LIMITS.", font=font_hero, fill=(255, 255, 255))

    font_tag = ImageFont.truetype(FONT_BOLD, 20)
    draw.text((74, 264), "CURATED VALUE BUNDLES & SEASONAL DROPS", font=font_tag, fill=(220, 195, 145))

    font_desc = ImageFont.truetype(FONT_REGULAR, 20)
    draw.text((74, 318), "Upgrade your active rotation with curated bundle discounts, multi-item offers,", font=font_desc, fill=(148, 138, 125))
    draw.text((74, 348), "and flexible installment plans with 0% interest.", font=font_desc, fill=(148, 138, 125))

    draw.line([(72, 420), (1128, 420)], fill=(44, 36, 26), width=1)

    font_badge = ImageFont.truetype(FONT_BOLD, 14)
    draw_pill(draw, (72, 470, 344, 526), "SAVE UP TO 30% ON COMBOS", font_badge,
              bg_color=(28, 22, 14), border_color=(66, 52, 30), text_color=(245, 220, 160))
    draw_pill(draw, (362, 470, 624, 526), "PAY IN 3 WITH KOKO", font_badge,
              bg_color=(20, 18, 14), border_color=(50, 44, 32), text_color=(235, 225, 210))
    draw_pill(draw, (642, 470, 894, 526), "CASH ON DELIVERY", font_badge,
              bg_color=(20, 18, 14), border_color=(50, 44, 32), text_color=(235, 225, 210))
    draw_pill(draw, (930, 470, 1128, 526), "neverbe.lk", font_badge,
              bg_color=(36, 28, 18), border_color=(76, 58, 32), text_color=(255, 255, 255), with_arrow=True)

    im.save("public/offers-og.png", format="PNG", optimize=True)
    print("Generated public/offers-og.png (1200x630)")

# -------------------------------------------------------------
# 4. DIGITAL RECEIPT & E-BILL OG (Nike / Adidas Sportswear Style)
# -------------------------------------------------------------
def generate_ebill_og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (8, 9, 8))
    draw_subtle_radial(im, 420, 280, 560, (22, 27, 24), (8, 9, 8))
    draw = ImageDraw.Draw(im)

    font_wm = ImageFont.truetype(FONT_WATERMARK, 210)
    draw.text((640, 160), "NEVERBE", font=font_wm, fill=(14, 18, 15))

    draw_athletic_stripes(draw, W, H, stripe_color=(20, 24, 22))
    draw_corner_accents(draw, W, H, pad=48, size=28, color=(44, 50, 46))

    logo = get_white_logo(height=42)
    im.paste(logo, (72, 60), logo)

    font_eyebrow = ImageFont.truetype(FONT_BOLD, 12)
    draw_pill(draw, (860, 62, 1128, 98), "OFFICIAL DIGITAL ORDER INVOICE", font_eyebrow,
              bg_color=(18, 24, 20), border_color=(46, 58, 50), text_color=(185, 205, 192))

    font_hero = ImageFont.truetype(FONT_HERO, 72)
    draw.text((72, 162), "ORDER CONFIRMED.", font=font_hero, fill=(255, 255, 255))

    font_tag = ImageFont.truetype(FONT_BOLD, 20)
    draw.text((74, 264), "VERIFIED DIGITAL ORDER & DISPATCH CONFIRMATION", font=font_tag, fill=(160, 180, 170))

    font_desc = ImageFont.truetype(FONT_REGULAR, 20)
    draw.text((74, 318), "Thank you for shopping with Neverbe. Your purchase has been confirmed", font=font_desc, fill=(130, 142, 134))
    draw.text((74, 348), "and is currently being packed for tracked island-wide delivery.", font=font_desc, fill=(130, 142, 134))

    draw.line([(72, 420), (1128, 420)], fill=(32, 40, 36), width=1)

    font_badge = ImageFont.truetype(FONT_BOLD, 14)
    draw_pill(draw, (72, 470, 316, 526), "VERIFIED PURCHASE", font_badge,
              bg_color=(16, 24, 18), border_color=(44, 58, 46), text_color=(235, 245, 238))
    draw_pill(draw, (334, 470, 594, 526), "ISLAND-WIDE SHIPPING", font_badge,
              bg_color=(16, 24, 18), border_color=(44, 58, 46), text_color=(235, 245, 238))
    draw_pill(draw, (612, 470, 894, 526), "SUPPORT: 072 924 9999", font_badge,
              bg_color=(16, 24, 18), border_color=(44, 58, 46), text_color=(235, 245, 238))
    draw_pill(draw, (930, 470, 1128, 526), "neverbe.lk", font_badge,
              bg_color=(28, 38, 30), border_color=(56, 74, 60), text_color=(255, 255, 255), with_arrow=True)

    im.save("public/ebill-og.png", format="PNG", optimize=True)
    print("Generated public/ebill-og.png (1200x630)")

# -------------------------------------------------------------
# 5. COLLECTION PLACEHOLDER (Nike / Adidas Sportswear Style)
# -------------------------------------------------------------
def generate_placeholder():
    S = 800
    im = Image.new("RGB", (S, S), (12, 14, 12))
    draw_subtle_radial(im, 400, 400, 380, (24, 28, 24), (12, 14, 12))
    draw = ImageDraw.Draw(im)

    draw.rounded_rectangle([32, 32, S - 32, S - 32], radius=24, outline=(38, 44, 38), width=2)
    draw_corner_accents(draw, S, S, pad=56, size=24, color=(52, 60, 52))

    logo = get_white_logo(height=58)
    lx = (S - logo.width) // 2
    ly = 320
    im.paste(logo, (lx, ly), logo)

    font_sub = ImageFont.truetype(FONT_BOLD, 13)
    text = "NEVERBE SPORTSWEAR"
    bbox = font_sub.getbbox(text)
    tw = bbox[2] - bbox[0]
    draw.text(((S - tw) // 2, ly + 90), text, font=font_sub, fill=(130, 140, 130))

    font_status = ImageFont.truetype(FONT_REGULAR, 12)
    s_text = "AUTHENTIC ROTATION · COMING SOON"
    s_bbox = font_status.getbbox(s_text)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text(((S - s_w) // 2, ly + 120), s_text, font=font_status, fill=(90, 100, 90))

    im.save("public/collection-placeholder.png", format="PNG", optimize=True)
    print("Generated public/collection-placeholder.png (800x800)")

if __name__ == "__main__":
    generate_main_og()
    generate_collections_og()
    generate_offers_og()
    generate_ebill_og()
    generate_placeholder()
