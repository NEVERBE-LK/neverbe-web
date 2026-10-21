"use client";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useSelector,useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import type { RootState,AppDispatch } from "@/redux/store";
import { showBag } from "@/redux/bagSlice/bagSlice";
import { calculateTotal,calculateTotalDiscount } from "@/utils/bagCalculations";
import usePromotions from "@/hooks/usePromotions";
export default function MobileCheckoutBar(){
 const {bag,couponDiscount,promotionDiscount,showBag:open}=useSelector((s:RootState)=>s.bag);const dispatch=useDispatch<AppDispatch>();const path=usePathname();usePromotions();
 if(!bag.length||open||/^\/(checkout|cart|account|policies)/.test(path))return null;
 const total=Math.max(0,calculateTotal(bag)-calculateTotalDiscount(bag)-couponDiscount-promotionDiscount);
 return <div className="commerce-mobile-cart"><button type="button" onClick={()=>dispatch(showBag())} aria-label="Open your bag"><ShoppingBag size={20}/><span><small>Your bag · before delivery</small><strong>LKR {total.toLocaleString("en-LK")}</strong></span></button><Link href="/cart">Review bag<ArrowRight size={16}/></Link></div>;
}
