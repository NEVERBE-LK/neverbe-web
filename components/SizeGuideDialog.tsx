"use client";
import { useState } from "react";
import { Modal } from "antd";
import Link from "next/link";
interface SizeGuideDialogProps {isOpen:boolean;onClose:()=>void;}
const menSizes = [
  { us: "7", uk: "6", eu: "40", cm: "25" },
  { us: "7.5", uk: "6.5", eu: "40.5", cm: "25.5" },
  { us: "8", uk: "7", eu: "41", cm: "26" },
  { us: "8.5", uk: "7.5", eu: "42", cm: "26.5" },
  { us: "9", uk: "8", eu: "42.5", cm: "27" },
  { us: "9.5", uk: "8.5", eu: "43", cm: "27.5" },
  { us: "10", uk: "9", eu: "44", cm: "28" },
  { us: "10.5", uk: "9.5", eu: "44.5", cm: "28.5" },
  { us: "11", uk: "10", eu: "45", cm: "29" },
  { us: "11.5", uk: "10.5", eu: "45.5", cm: "29.5" },
  { us: "12", uk: "11", eu: "46", cm: "30" },
];

const womenSizes = [
  { us: "5", uk: "2.5", eu: "35.5", cm: "22" },
  { us: "5.5", uk: "3", eu: "36", cm: "22.5" },
  { us: "6", uk: "3.5", eu: "36.5", cm: "23" },
  { us: "6.5", uk: "4", eu: "37.5", cm: "23.5" },
  { us: "7", uk: "4.5", eu: "38", cm: "24" },
  { us: "7.5", uk: "5", eu: "38.5", cm: "24.5" },
  { us: "8", uk: "5.5", eu: "39", cm: "25" },
  { us: "8.5", uk: "6", eu: "40", cm: "25.5" },
  { us: "9", uk: "6.5", eu: "40.5", cm: "26" },
  { us: "9.5", uk: "7", eu: "41", cm: "26.5" },
  { us: "10", uk: "7.5", eu: "42", cm: "27" },
];

const kidSizes = [
  { us: "10C", uk: "9.5", eu: "27", cm: "16" },
  { us: "11C", uk: "10.5", eu: "28", cm: "17" },
  { us: "12C", uk: "11.5", eu: "29.5", cm: "18" },
  { us: "13C", uk: "12.5", eu: "31", cm: "19" },
  { us: "1Y", uk: "13.5", eu: "32", cm: "20" },
  { us: "2Y", uk: "1.5", eu: "33.5", cm: "21" },
  { us: "3Y", uk: "2.5", eu: "35", cm: "22" },
  { us: "4Y", uk: "3.5", eu: "36", cm: "23" },
  { us: "5Y", uk: "4.5", eu: "37.5", cm: "23.5" },
  { us: "6Y", uk: "5.5", eu: "38.5", cm: "24" },
];


export default function SizeGuideDialog({isOpen,onClose}:SizeGuideDialogProps){
 const [tab,setTab]=useState("men");const sizes=tab==="men"?menSizes:tab==="women"?womenSizes:kidSizes;
 return <Modal open={isOpen} onCancel={onClose} zIndex={1200} footer={null} width={640} title="Find your fit." centered rootClassName="commerce-modal commerce-size-guide"><p className="commerce-muted">A general footwear conversion guide. Sizing varies between brands and styles; check the product details before choosing.</p><div className="commerce-guide-tabs" aria-label="Sizing guide">{["men","women","kids","apparel"].map(value=><button type="button" key={value} aria-pressed={tab===value} onClick={()=>setTab(value)}>{value}</button>)}</div>{tab==="apparel"?<div className="commerce-guide-apparel"><h3>Apparel sizing is product specific.</h3><p>Measure your chest, waist, and hips and compare them with any measurements in the product description. Generic XS–XXL labels are not consistent between brands.</p><Link href="/contact" onClick={onClose}>Ask our team about your fit →</Link></div>:<div className="commerce-guide-table"><table><caption className="sr-only">{tab}’s footwear size conversion</caption><thead><tr>{["US","UK","EU","Length (cm)"].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{sizes.map(size=><tr key={`${size.us}-${size.eu}`}><td>{size.us}</td><td>{size.uk}</td><td>{size.eu}</td><td>{size.cm}</td></tr>)}</tbody></table></div>}</Modal>;
}
