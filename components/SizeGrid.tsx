"use client";
interface Props { sizes:string[]; selectedSize:string; onSelectSize:(size:string)=>void; stockMap?:Record<string,number>;stockLoading?:boolean;disabled?:boolean;className?:string; }
export default function SizeGrid({sizes,selectedSize,onSelectSize,stockMap={},stockLoading=false,disabled=false,className=""}:Props) {
 return <div className={`commerce-size-grid ${className}`} role="group" aria-label="Select size" aria-busy={stockLoading}>{sizes.map(size=>{const unavailable=stockMap[size]!==undefined&&stockMap[size]<=0;return <button type="button" key={size} disabled={disabled||unavailable||stockLoading} aria-pressed={selectedSize===size} aria-label={`Size ${size}${unavailable?", sold out":""}`} onClick={()=>onSelectSize(size)}>{size}</button>;})}</div>;
}
