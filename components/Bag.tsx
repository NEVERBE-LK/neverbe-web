"use client";
import { Drawer } from "antd";
import { X } from "lucide-react";
import { useDispatch,useSelector } from "react-redux";
import type { AppDispatch,RootState } from "@/redux/store";
import { hideBag } from "@/redux/bagSlice/bagSlice";
import CartContents from "./CartContents";
export default function Bag() {
 const dispatch=useDispatch<AppDispatch>();const state=useSelector((s:RootState)=>s.bag);const close=()=>dispatch(hideBag());const count=state.bag.reduce((n,i)=>n+i.quantity,0);
 return <Drawer open={state.showBag} onClose={close} size={520} placement="right" closable={false} rootClassName="commerce-drawer commerce-cart-drawer" styles={{wrapper:{maxWidth:"100vw"},body:{padding:0}}}><div className="commerce-drawer-heading"><div><p className="sport-eyebrow">A GOOD CHOICE LOOKS GOOD ON YOU</p><h2>Your bag <span>({count})</span></h2></div><button className="sport-icon" type="button" aria-label="Close bag" onClick={close}><X size={22}/></button></div><CartContents compact onNavigate={close}/></Drawer>;
}
