"use client";
import { formatVariantName } from "@/utils/formatting";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Minus, Plus, Truck, RotateCcw } from "lucide-react";
import Spinner from "@/components/Spinner";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  IoHeartOutline,
  IoHeart,
  IoAddOutline,
  IoRemoveOutline,
} from "react-icons/io5";
import { FaWhatsapp, FaTruckFast, FaArrowRotateLeft } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { AppDispatch, RootState } from "@/redux/store";
import { addToBag } from "@/redux/bagSlice/bagSlice";
import {
  toggleWishlist,
  hydrateWishlist,
  WishlistItem,
} from "@/redux/wishlistSlice/wishlistSlice";
import { Product } from "@/interfaces/Product";
import { ProductVariant } from "@/interfaces/ProductVariant";
import { KOKOLogo } from "@/assets/images";
import SizeGuideDialog from "@/components/SizeGuideDialog";
import { usePromotionsContext } from "@/components/PromotionsProvider";
import {
  ProductVariantTarget,
  PromotionCondition,
} from "@/interfaces/Promotion";
import { isVariantEligibleForPromotion } from "@/utils/promotionUtils";
import {
  calculateFinalPrice,
  getOriginalPrice,
  hasDiscount as checkHasDiscount,
  hasConditions,
} from "@/utils/pricing";
import StockBadge from "@/components/StockBadge";
import ShareButtons from "@/components/ShareButtons";
import SizeGrid from "@/components/SizeGrid";
import axiosInstance from "@/actions/axiosInstance";

const ProductHero = ({ item }: { item: Product }) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const bagItems = useSelector((state: RootState) => state.bag.bag);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { getPromotionForProduct } = usePromotionsContext();

  useEffect(() => {
    dispatch(hydrateWishlist());
  }, [dispatch]);

  const initialVariant = item.variants?.[0] || { id: "", variantId: "", variantName: "", images: [], sizes: [], status: false };
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [selectedImage, setSelectedImage] = useState(initialVariant.images?.[0] || item.thumbnail);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  const [stockLoading, setStockLoading] = useState(Boolean(initialVariant.variantId && initialVariant.sizes?.length));
  const [stockError, setStockError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [allVariantStock, setAllVariantStock] = useState<
    Record<string, number>
  >({});

  const activePromo = getPromotionForProduct(
    item.id,
    selectedVariant.variantId,
  );

  const discountedPrice = calculateFinalPrice(item, activePromo);
  const originalPrice = getOriginalPrice(item);
  const hasAnyDiscount = checkHasDiscount(item, activePromo);
  const totalSavings = Math.max(0, originalPrice - discountedPrice);
  const isPromoDiscount = !!activePromo && !hasConditions(activePromo);
  const hasItemDiscount = Boolean((item.discount || 0) > 0);

  const getVariantPromotion = (variantId: string) => {
    const promo = getPromotionForProduct(item.id, variantId);
    if (!promo) return null;

    const isEligible = isVariantEligibleForPromotion(
      item.id,
      variantId,
      promo.applicableProductVariants as ProductVariantTarget[] | undefined,
      promo.conditions as PromotionCondition[] | undefined,
    );

    return isEligible ? promo : null;
  };

  useEffect(() => {
    if (!selectedVariant.variantId || !selectedVariant.sizes?.length) {
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({
      productId: item.id,
      variantId: selectedVariant.variantId,
      sizes: selectedVariant.sizes.join(","),
    });
    axiosInstance
      .get(`/web/inventory/batch?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setSizeStock(res.data.stock || {});
      })
      .catch(() => {
        if (!controller.signal.aborted) setStockError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setStockLoading(false);
      });
    return () => controller.abort();
  }, [selectedVariant.variantId, selectedVariant.sizes, item.id]);

  const availableStock = selectedSize ? sizeStock[selectedSize] ?? 0 : 0;
  const bagQty =
    bagItems.find(
      (b) =>
        b.itemId === item.id &&
        b.variantId === selectedVariant.variantId &&
        b.size === selectedSize,
    )?.quantity || 0;
  const isLimitReached =
    selectedSize !== "" && availableStock > 0 && bagQty + qty > availableStock;

  const isInWishlist = wishlistItems.some(
    (w) => w.productId === item.id && w.variantId === selectedVariant.variantId,
  );

  const handleToggleWishlist = () => {
    const wishlistItem: WishlistItem = {
      productId: item.id,
      variantId: selectedVariant.variantId,
      name: item.name,
      thumbnail: selectedVariant.images?.[0]?.url || item.thumbnail?.url || "/collection-placeholder.png",
      price: item.sellingPrice,
      addedAt: new Date().toISOString(),
    };
    dispatch(toggleWishlist(wishlistItem));
  };

  const handleVariantChange = (variant: ProductVariant) => {
    // A repeated tap must preserve the loaded stock, selected size and quantity.
    if (variant.variantId === selectedVariant.variantId) return;
    setSelectedVariant(variant);
    setSelectedImage(variant.images?.[0] || item.thumbnail);
    setSelectedSize("");
    setQty(1);
    setSizeStock({});
    setStockLoading(Boolean(variant.variantId && variant.sizes?.length));
    setStockError(false);
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (stockLoading || stockError || qty + bagQty > availableStock) { toast.error("Please choose an available size and quantity."); return; }
    const productDiscount =
      Math.round(((item.discount / 100) * item.sellingPrice * qty) / 10) * 10;
    dispatch(
      addToBag({
        itemId: item.id,
        variantId: selectedVariant.variantId,
        size: selectedSize,
        quantity: qty,
        price: item.sellingPrice,
        name: item.name,
        thumbnail: selectedVariant.images?.[0]?.url || item.thumbnail?.url || "/collection-placeholder.png",
        itemType: "product",
        variantName: selectedVariant.variantName,
        discount: productDiscount,
        maxQuantity: Math.min(10, availableStock),
        category: item.category || "",
        brand: item.brand || "",
        weight: item.weight || 1000,
      } as any),
    );
    toast.success(`Added ${qty} item${qty > 1 ? "s" : ""} to bag`);
    setQty(1);
  };

  const images = selectedVariant.images?.length ? selectedVariant.images : [item.thumbnail];
  const canAdd = !!selectedSize && !stockLoading && !stockError && availableStock > 0 && !isLimitReached;
  return <section className="commerce-product-detail">
    <div className="commerce-product-gallery"><div className="commerce-product-main-image"><Image src={selectedImage?.url || item.thumbnail?.url || "/collection-placeholder.png"} alt={item.name} fill preload sizes="(max-width:900px) 100vw, 58vw"/>{item.isNewArrival&&<span className="commerce-product-badge">Just landed</span>}</div><div className="commerce-product-thumbnails" role="group" aria-label="Product images">{images.filter(Boolean).map((image,index)=><button type="button" key={`${image.url}-${index}`} onClick={()=>setSelectedImage(image)} aria-label={`View image ${index+1} of ${item.name}`} aria-pressed={selectedImage?.url===image.url}><Image src={image.url||"/collection-placeholder.png"} alt={`${item.name}, view ${index+1}`} fill sizes="90px"/></button>)}</div></div>
    <div className="commerce-product-info"><p className="sport-eyebrow">{item.brand?.replaceAll("-"," ")||"THE NEVERBE COLLECTION"}</p><h1>{item.name}</h1><p className="commerce-product-category">{item.category?.replaceAll("-"," ")}</p><div className={`commerce-product-price ${hasItemDiscount ? "has-discount" : ""}`}><strong className={hasItemDiscount ? "text-error" : ""}>LKR {discountedPrice.toLocaleString("en-LK")}</strong>{originalPrice>discountedPrice&&<del>LKR {originalPrice.toLocaleString("en-LK")}</del>}</div>{discountedPrice>0&&<div className="commerce-product-koko" aria-label={`or 3 installments of LKR ${Math.round(discountedPrice/3).toLocaleString("en-LK")} with Koko`}><span>or 3 interest-free payments of <strong>LKR {Math.round(discountedPrice/3).toLocaleString("en-LK")}</strong> with</span><Image src={KOKOLogo} alt="Koko" width={38} height={17} className="commerce-koko-logo"/></div>}{activePromo&&<div className="commerce-product-promo">{activePromo.name}</div>}
    <div className="commerce-product-selection"><div className="commerce-label-row"><h2>Choose your colour</h2><span>{formatVariantName(selectedVariant.variantName)}</span></div><div className="commerce-product-variants">{item.variants?.map(variant=><button key={variant.variantId} type="button" title={formatVariantName(variant.variantName)} aria-label={formatVariantName(variant.variantName)||"Product option"} aria-pressed={selectedVariant.variantId===variant.variantId} onClick={()=>handleVariantChange(variant)}><Image src={variant.images?.[0]?.url||item.thumbnail?.url||"/collection-placeholder.png"} alt={formatVariantName(variant.variantName)||item.name} fill sizes="64px"/></button>)}</div></div>
    <div className="commerce-product-selection"><div className="commerce-label-row"><h2>Select size</h2><button type="button" onClick={()=>setShowSizeGuide(true)}>Size guide</button></div><SizeGrid sizes={selectedVariant.sizes||[]} selectedSize={selectedSize} onSelectSize={size=>{setSelectedSize(size);setQty(1);}} stockMap={sizeStock} stockLoading={stockLoading} disabled={stockError}/>{stockLoading&&<div className="commerce-stock-loading"><Spinner/></div>}{stockError&&<p className="commerce-error" role="alert">Availability couldn’t be checked. Please refresh or contact us before ordering.</p>}{!selectedVariant.sizes?.length&&<p className="commerce-muted">This option is currently unavailable.</p>}</div>
    <div className="commerce-label-row"><h2>Quantity</h2><div className="commerce-quantity"><button type="button" aria-label="Decrease quantity" disabled={qty<=1} onClick={()=>setQty(n=>Math.max(1,n-1))}><Minus size={15}/></button><span>{qty}</span><button type="button" aria-label="Increase quantity" disabled={!selectedSize||qty>=Math.min(10,availableStock-bagQty)} onClick={()=>setQty(n=>Math.min(10,availableStock-bagQty,n+1))}><Plus size={15}/></button></div></div>
    <div className="commerce-product-buy"><button type="button" className="commerce-primary" disabled={!canAdd} onClick={handleAddToBag}>Add to bag <ArrowRight size={18}/></button><button type="button" className="commerce-save" aria-label={isInWishlist?"Remove from favourites":"Save to favourites"} aria-pressed={isInWishlist} onClick={handleToggleWishlist}><Heart size={21} fill={isInWishlist?"currentColor":"none"}/></button></div>
    <p className="commerce-product-hint">{selectedSize?availableStock>0?isLimitReached?"This quantity exceeds the stock available for your size.":`Size ${selectedSize} selected. Ready for your next move.`:"This size is currently sold out.":"Select an available size to add this item to your bag."}</p>
    <div className="commerce-product-benefits"><span><Truck size={18}/> Delivery across Sri Lanka</span><span><RotateCcw size={18}/><Link href="/policies/shipping-return-policy">Delivery & exchange policy</Link></span></div>
    <details className="commerce-product-accordion" open><summary>The details</summary><div className="commerce-prose"><ReactMarkdown rehypePlugins={[rehypeRaw]}>{item.description||"Explore your new everyday essential. Contact our team if you need help choosing the right fit."}</ReactMarkdown></div></details><details className="commerce-product-accordion"><summary>Delivery & payment</summary><p>Prices are in Sri Lankan rupees. Delivery fees and available payment options are confirmed at checkout.</p><Link href="/policies/shipping-return-policy">Read our delivery and return policy</Link></details><div className="commerce-product-share"><ShareButtons title={item.name} url={`/collections/products/${item.id}`} /><Link href="/contact">Need help choosing?</Link></div>
    </div><SizeGuideDialog isOpen={showSizeGuide} onClose={()=>setShowSizeGuide(false)}/>
  </section>;
};
export default ProductHero;
