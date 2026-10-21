"use client";
import { useEffect } from "react";
import useCoupon from "@/hooks/useCoupon";
import Spinner from "./Spinner";
export default function CouponInput({className="",onDiscountChange}:{className?:string;onDiscountChange?:(discount:number)=>void}){
 const {couponState,setCode,validateCoupon,removeCouponFromCart,isBlocked,hasComboItems}=useCoupon({autoValidate:false,debounceMs:600});
 useEffect(()=>{onDiscountChange?.(couponState.discount);},[couponState.discount,onDiscountChange]);
 return <div className={`commerce-coupon ${className}`}>{isBlocked&&hasComboItems&&<p className="commerce-muted">Coupons cannot be combined with this bundle.</p>}<form onSubmit={event=>{event.preventDefault();if(!couponState.isApplied&&!isBlocked)validateCoupon();}}><label className="sr-only" htmlFor="promo-code">Promo code</label><input id="promo-code" value={couponState.code} onChange={event=>setCode(event.target.value)} placeholder="Promo code" disabled={couponState.isApplied||isBlocked} autoComplete="off"/><button type={couponState.isApplied?"button":"submit"} onClick={couponState.isApplied?removeCouponFromCart:undefined} disabled={isBlocked||couponState.isValidating}>{couponState.isValidating?<Spinner/>:couponState.isApplied?"Remove":"Apply"}</button></form>{!couponState.isValidating&&couponState.message&&<p className="commerce-coupon-message" role="status">{couponState.message}</p>}</div>;
}
