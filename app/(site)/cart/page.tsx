import type { Metadata } from "next";
import CartContents from "@/components/CartContents";
import Link from "next/link";
export const metadata:Metadata={title:"Your bag | NEVERBE",robots:{index:false,follow:false}};
export default function CartPage(){return <div className="commerce-cart-page"><div className="commerce-page-heading"><p className="sport-eyebrow">YOUR NEXT ROTATION</p><h1>Good things in your bag.</h1><Link href="/collections/products" className="sport-text-link">Keep exploring</Link></div><CartContents/></div>;}
