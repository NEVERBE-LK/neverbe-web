"use client";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Trash2 } from "lucide-react";
import type { BagItem } from "@/interfaces/BagItem";
import { removeFromBag } from "@/redux/bagSlice/bagSlice";
export default function BagItemCard({item,compact=false,showRemove=false}:{item:BagItem;compact?:boolean;showRemove?:boolean}) {
 const dispatch=useDispatch();return <div className={`commerce-checkout-item ${compact?"is-compact":""}`}><div className="commerce-checkout-item-image"><Image src={item.thumbnail||"/collection-placeholder.png"} alt={item.name} fill sizes={compact?"64px":"90px"}/></div><div><h3>{item.name}</h3><p>{item.variantName}</p><p>Size {item.size} · Qty {item.quantity}</p>{item.isComboItem&&<p>{item.comboName||"Bundle"}</p>}<strong>LKR {Math.max(0,item.price*item.quantity-item.discount).toLocaleString("en-LK")}</strong>{showRemove&&!item.isComboItem&&<button type="button" className="commerce-remove" onClick={()=>dispatch(removeFromBag(item))} aria-label={`Remove ${item.name}, size ${item.size}`}><Trash2 size={14}/>Remove</button>}</div></div>;
}
