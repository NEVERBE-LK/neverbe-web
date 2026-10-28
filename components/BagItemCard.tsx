"use client";
import { formatVariantName } from "@/utils/formatting";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Trash2 } from "lucide-react";
import type { BagItem } from "@/interfaces/BagItem";
import { removeFromBag } from "@/redux/bagSlice/bagSlice";
export default function BagItemCard({item,compact=false,showRemove=false}:{item:BagItem;compact?:boolean;showRemove?:boolean}) {
 const dispatch=useDispatch();
 const hasDiscount = (item.discount || 0) > 0;
 const netPrice = Math.max(0, item.price * item.quantity - item.discount);
 const originalPrice = item.price * item.quantity;
 return <div className={`commerce-checkout-item ${compact?"is-compact":""}`}><div className="commerce-checkout-item-image"><Image src={item.thumbnail||"/collection-placeholder.png"} alt={item.name} fill sizes={compact?"64px":"90px"}/></div><div><h3>{item.name}</h3><p>{formatVariantName(item.variantName)}</p><p>Size {item.size} · Qty {item.quantity}</p>{item.isComboItem&&<p>{item.comboName||"Bundle"}</p>}<strong className={hasDiscount ? "text-error" : ""}>LKR {netPrice.toLocaleString("en-LK")}</strong>{hasDiscount&&<del className="text-secondary text-xs line-through block mt-0.5">LKR {originalPrice.toLocaleString("en-LK")}</del>}{showRemove&&!item.isComboItem&&<button type="button" className="commerce-remove" onClick={()=>dispatch(removeFromBag(item))} aria-label={`Remove ${item.name}, size ${item.size}`}><Trash2 size={14}/>Remove</button>}</div></div>;
}
