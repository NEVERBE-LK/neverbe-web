"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/interfaces/Product";
import { calculateFinalPrice, getDiscountType, getDiscountColorClass } from "@/utils/pricing";
import { usePromotionsContext } from "./PromotionsProvider";
export default function SearchResultCard({item,onClick,variant="list"}:{item:Product;onClick:()=>void;variant?:"list"|"card"}){
 const {getPromotionForProduct}=usePromotionsContext();
 const promo=getPromotionForProduct(item.id,item.variants?.[0]?.variantId);
 const price=calculateFinalPrice(item,promo);
 const discountType=getDiscountType(item,promo);
 const discountColorClass=getDiscountColorClass(discountType);
 return <Link href={`/collections/products/${item.id}`} onClick={onClick} className={`commerce-search-result ${variant==="card"?"is-card":""}`}><div><Image src={item.thumbnail?.url||"/collection-placeholder.png"} alt={item.name} fill sizes={variant==="card"?"180px":"64px"}/></div><section><p>{item.category?.replaceAll("-"," ")}</p><h3>{item.name}</h3><strong className={discountColorClass}>LKR {price.toLocaleString("en-LK")}</strong></section></Link>;
}
