"use client";
import { Link as LinkIcon,Share2 } from "lucide-react";
import toast from "react-hot-toast";
export default function ShareButtons({title,url,className=""}:{title:string;url:string;image?:string;className?:string}){
 const copy=async()=>{try{await navigator.clipboard.writeText(new URL(url,window.location.origin).href);toast.success("Link copied.");}catch{toast.error("Couldn’t copy the link.");}};
 const share=async()=>{const fullUrl=new URL(url,window.location.origin).href;if(navigator.share){try{await navigator.share({title,url:fullUrl});}catch{/* Cancellation leaves the page unchanged. */}}else await copy();};
 return <div className={`commerce-share ${className}`}><button type="button" onClick={share} aria-label="Share product"><Share2 size={16}/></button><button type="button" onClick={copy} aria-label="Copy product link"><LinkIcon size={16}/></button></div>;
}
