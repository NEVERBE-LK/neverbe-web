"use client";
import { ShoppingBag } from "lucide-react";
export default function EmptyState({heading,subHeading,actionLabel,onAction}:{heading:string;subHeading?:string;actionLabel?:string;onAction?:()=>void}) {
 return <div className="commerce-empty"><span className="commerce-empty-icon"><ShoppingBag size={32} strokeWidth={1.3}/></span><h2>{heading}</h2><p>{subHeading||"Try another filter or explore something new."}</p>{actionLabel&&onAction&&<button type="button" className="commerce-primary" onClick={onAction}>{actionLabel}</button>}</div>;
}
