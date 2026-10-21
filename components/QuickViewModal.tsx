"use client";

import { Drawer } from "antd";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import type { Product } from "@/interfaces/Product";
import ProductHero from "@/app/(site)/collections/products/[itemId]/components/ProductHero";

export default function QuickViewModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}) {
  return (
    <Drawer
      open={isOpen && !!product}
      onClose={onClose}
      placement="right"
      size={580}
      closable={false}
      destroyOnHidden
      rootClassName="commerce-drawer commerce-quick-view-drawer"
      styles={{
        wrapper: { maxWidth: "100vw", width: "min(580px, 100vw)" },
        body: { padding: 0 },
      }}
    >
      <div className="commerce-drawer-heading">
        <div>
          <p className="sport-eyebrow">QUICK VIEW</p>
          <h2>A closer look</h2>
        </div>
        <button
          className="sport-icon"
          type="button"
          aria-label="Close quick view"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>

      <div className="commerce-drawer-scroll">
        {product && <ProductHero key={product.id} item={product} />}
      </div>

      {product && (
        <div className="commerce-drawer-footer">
          <Link
            href={`/collections/products/${product.id}`}
            onClick={onClose}
            className="commerce-quick-view-link"
          >
            View full product details <ArrowRight size={16} />
          </Link>
          <p>Complete specifications, size details & customer reviews.</p>
        </div>
      )}
    </Drawer>
  );
}
