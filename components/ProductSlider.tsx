"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ItemCard from "./ItemCard";
import type { Product } from "@/interfaces/Product";
export default function ProductSlider({title,items,subtitle,viewAllHref,className=""}:{title:string;items:Product[];subtitle?:string;viewAllHref?:string;className?:string}){
 if(!items?.length)return null;
 return <section className={`commerce-product-rail ${className}`}><div className="sport-section-heading"><div><p className="sport-eyebrow">KEEP EXPLORING</p><h2>{title}</h2>{subtitle&&<p className="commerce-muted">{subtitle}</p>}</div>{viewAllHref&&<Link href={viewAllHref} className="sport-text-link">View all <ArrowUpRight size={17}/></Link>}</div><div className="commerce-rail-items">{items.map(item=><ItemCard key={item.id} item={item}/>)}</div></section>;
}
