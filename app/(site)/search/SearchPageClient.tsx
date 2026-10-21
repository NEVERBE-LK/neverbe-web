"use client";
import { Search } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/interfaces/Product";
export default function SearchPageClient({query,products}:{query:string;products:Product[]}){
 return <div className="commerce-search-page"><div className="commerce-page-heading"><p className="sport-eyebrow">FIND WHAT MOVES YOU</p><h1>{query?`Your search for “${query}”.`:"What are you looking for?"}</h1><form action="/search" role="search" className="commerce-search-form"><input type="search" name="q" defaultValue={query} placeholder="Sneakers, activewear, everyday essentials…" aria-label="Search products" minLength={2} required/><button type="submit" aria-label="Submit search"><Search size={20}/></button></form>{query&&<p>{products.length} {products.length===1?"result":"results"}</p>}</div>{query&&<ProductGrid products={products} loading={false} emptyHeading="Nothing here just yet." emptySubHeading="Try a different word, check the spelling, or explore the collection."/>}</div>;
}
