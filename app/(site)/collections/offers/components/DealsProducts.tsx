"use client";
import Products from "../../products/components/Products";
import type { Product } from "@/interfaces/Product";
export default function DealsProducts({items}:{items:Product[]}) { return <Products items={items} apiEndpoint="/web/products/deals"/>; }
