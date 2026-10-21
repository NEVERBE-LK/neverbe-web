"use client";
import Link from "next/link";
import { Drawer } from "antd";
import { ArrowUpRight, X, UserRound, Heart, MapPin } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { toggleMenu } from "@/redux/headerSlice/headerSlice";
import type { NavigationItem } from "@/actions/websiteAction";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
const defaults = [
 {title:"New arrivals",link:"/collections/new-arrivals"}, {title:"Men",link:"/collections/products?gender=men"},
 {title:"Women",link:"/collections/products?gender=women"}, {title:"Shop everything",link:"/collections/products"},
 {title:"Combos",link:"/collections/combos"}, {title:"Offers",link:"/collections/offers"},
];
export default function Menu({mainNav=[]}:{mainNav?:NavigationItem[]}) {
 const dispatch=useDispatch<AppDispatch>();
 const open=useSelector((s:RootState)=>s.headerSlice.showMenu);
 const close=()=>dispatch(toggleMenu(false));
 return <Drawer open={open} onClose={close} placement="right" size={430} closable={false} rootClassName="commerce-drawer commerce-menu" title={null} styles={{wrapper:{maxWidth:"100vw"},body:{padding:0}}}>
  <div className="commerce-drawer-heading"><Link href="/" onClick={close} aria-label="Neverbe home"><BrandLogo /></Link><button type="button" className="sport-icon" onClick={close} aria-label="Close menu"><X size={23}/></button></div>
  <div className="commerce-menu-scroll"><p className="sport-eyebrow">FIND YOUR NEXT MOVE</p><nav aria-label="Mobile navigation" className="commerce-menu-links">{(mainNav.length?mainNav:defaults).map(item=><Link href={item.link} key={item.link} onClick={close}>{item.title}<ArrowUpRight size={21}/></Link>)}</nav>
  <div className="commerce-menu-account"><Link href="/account" onClick={close}><UserRound size={19}/> My account<ArrowUpRight size={16}/></Link><Link href="/account/wishlist" onClick={close}><Heart size={19}/> Saved favourites<ArrowUpRight size={16}/></Link></div>
  <div className="commerce-menu-help"><Link href="/contact" onClick={close}>Contact & support</Link><Link href="/policies/shipping-return-policy" onClick={close}>Delivery & returns</Link><Link href="/aboutUs" onClick={close}>About NEVERBE</Link></div></div>
  <div className="commerce-menu-bottom"><span><MapPin size={16}/> Sri Lanka · LKR</span><ThemeToggle/></div>
 </Drawer>;
}
