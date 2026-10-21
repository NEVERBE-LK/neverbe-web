"use client";
import { formatVariantName } from "@/utils/formatting";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/interfaces/Product";
import { usePromotionsContext } from "./PromotionsProvider";
import { useQuickView } from "./QuickViewProvider";
import { calculateFinalPrice, getOriginalPrice } from "@/utils/pricing";
import { KOKOLogo } from "@/assets/images";

function ItemCard({
  item,
  priority = false,
}: {
  item: Product;
  priority?: boolean;
}) {
  const [variant, setVariant] = useState(item.variants?.[0]);
  const { getPromotionForProduct } = usePromotionsContext();
  const { openQuickView } = useQuickView();

  const promotion = getPromotionForProduct(item.id, variant?.variantId);
  const price = calculateFinalPrice(item, promotion);
  const original = getOriginalPrice(item);
  const kokoInstallment = Math.round(price / 3);

  const image =
    variant?.images?.[0]?.url ||
    item.thumbnail?.url ||
    "/collection-placeholder.png";

  const label = !item.inStock
    ? "Sold out"
    : item.isRestockingSoon
    ? "Restock soon"
    : item.isNewArrival
    ? "Just landed"
    : promotion?.name ||
      ((item.discount || 0) > 0 ? `${item.discount}% off` : null);

  return (
    <article className="commerce-item-card">
      <div className="commerce-item-image">
        <Link href={`/collections/products/${item.id}`}>
          <Image
            src={image}
            alt={item.name}
            fill
            sizes="(max-width:640px) 45vw, (max-width:900px) 30vw, 24vw"
            preload={priority}
          />
        </Link>
        {label && <span className="commerce-item-badge">{label}</span>}
        <button
          type="button"
          className="commerce-item-quick"
          aria-label={`Quick view ${item.name}`}
          onClick={() => openQuickView(item)}
        >
          <Plus size={17} />
          <span>Quick view</span>
        </button>
      </div>

      <div className="commerce-item-copy">
        <p>{item.brand || item.category?.replaceAll("-", " ") || "NEVERBE"}</p>
        <Link
          href={`/collections/products/${item.id}`}
          className="text-primary hover:text-secondary transition-colors"
        >
          <h3 className="text-primary group-hover:text-secondary transition-colors">{item.name}</h3>
        </Link>
        <div className="commerce-item-price">
          <strong>LKR {price.toLocaleString("en-LK")}</strong>
          {original > price && (
            <del>LKR {original.toLocaleString("en-LK")}</del>
          )}
        </div>

        {price > 0 && (
          <div
            className="commerce-item-koko"
            aria-label={`or 3 installments of LKR ${kokoInstallment.toLocaleString("en-LK")} with Koko`}
          >
            <span>or 3 × LKR {kokoInstallment.toLocaleString("en-LK")} with</span>
            <Image
              src={KOKOLogo}
              alt="Koko"
              width={34}
              height={15}
              className="commerce-koko-logo"
            />
          </div>
        )}

        {item.variants?.length > 1 && (
          <div
            className="commerce-item-variants"
            role="group"
            aria-label={`Options for ${item.name}`}
          >
            {item.variants.slice(0, 5).map((option) => (
              <button
                type="button"
                key={option.variantId}
                title={formatVariantName(option.variantName)}
                aria-label={formatVariantName(option.variantName) || "Product option"}
                aria-pressed={variant?.variantId === option.variantId}
                onClick={() => setVariant(option)}
              >
                <Image
                  src={option.images?.[0]?.url || image}
                  alt={formatVariantName(option.variantName) || item.name}
                  fill
                  sizes="32px"
                />
              </button>
            ))}
            {item.variants.length > 5 && (
              <span>+{item.variants.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(ItemCard);
