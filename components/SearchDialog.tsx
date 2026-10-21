"use client";
import type { Product } from "@/interfaces/Product";
import SearchResultCard from "./SearchResultCard";
export default function SearchDialog({results,recommendations=[],onClick,containerStyle="",maxHeight="60vh"}:{results:Product[];recommendations?:Product[];onClick:()=>void;containerStyle?:string;maxHeight?:string}){
 const items=results.length?results:recommendations;return <div className={`commerce-search-dialog ${containerStyle}`} style={{maxHeight}}>{!results.length&&recommendations.length>0&&<p className="sport-eyebrow">WORTH A LOOK</p>}{items.map(item=><SearchResultCard key={item.id} item={item} onClick={onClick}/>)}{!items.length&&<p className="commerce-muted">Search for shoes, apparel and everyday essentials.</p>}</div>;
}
