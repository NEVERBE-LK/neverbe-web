"use client";
import Spinner from "@/components/Spinner";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch,useSelector } from "react-redux";
import { onAuthStateChanged,GoogleAuthProvider,linkWithPopup,signOut } from "firebase/auth";
import { LayoutGrid,Package,MapPin,Star,Settings,LogOut,ArrowUpRight } from "lucide-react";
import { auth } from "@/firebase/firebaseClient";
import type { RootState } from "@/redux/store";
import axiosInstance from "@/actions/axiosInstance";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileOverview from "./components/ProfileOverview";
import OrdersView from "./components/OrdersView";
import SavedAddresses from "./components/SavedAddresses";
import AccountSettings from "./components/AccountSettings";
import MyReviews from "./components/MyReviews";
import ReCaptchaProviderWrapper from "@/app/(site)/components/ReCaptchaProvider";
import toast from "react-hot-toast";
const tabs=[{id:"dashboard",label:"Overview",icon:LayoutGrid},{id:"orders",label:"Orders",icon:Package},{id:"addresses",label:"Addresses",icon:MapPin},{id:"reviews",label:"Reviews",icon:Star},{id:"details",label:"Settings",icon:Settings}];
export default function Account(){
 const router=useRouter();const dispatch=useDispatch();const user=useSelector((s:RootState)=>s.authSlice.user);const [active,setActive]=useState("dashboard");const [orders,setOrders]=useState<unknown[]>([]);const [addresses,setAddresses]=useState<{type:"Shipping"|"Billing";address:string;city:string;phone:string}[]>([]);const [loading,setLoading]=useState(true);const [failed,setFailed]=useState(false);const [attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();const unsubscribe=onAuthStateChanged(auth,async current=>{if(!current){router.replace("/account/login");return;}try{const token=await current.getIdToken();const options={headers:{Authorization:`Bearer ${token}`},signal:controller.signal};const results=await Promise.allSettled([axiosInstance.get("/web/orders",options),axiosInstance.get("/web/customers/addresses",options)]);if(controller.signal.aborted)return;setFailed(results.some(result=>result.status==="rejected"));const [ordersResult,addressResult]=results;if(ordersResult.status==="fulfilled")setOrders(Array.isArray(ordersResult.value.data)?ordersResult.value.data:[]);if(addressResult.status==="fulfilled")setAddresses(Array.isArray(addressResult.value.data)?addressResult.value.data:[]);}catch{if(!controller.signal.aborted)setFailed(true);}finally{if(!controller.signal.aborted)setLoading(false);}});return()=>{controller.abort();unsubscribe();};},[router,attempt]);
 const logout=async()=>{try{await signOut(auth);router.replace("/");}catch{toast.error("Couldn’t sign out. Please try again.");}};
 const linkGoogle=async()=>{if(!auth.currentUser)return;try{await linkWithPopup(auth.currentUser,new GoogleAuthProvider());toast.success("Your account is now linked.");}catch{toast.error("Account linking was not completed.");}};
 return <div className="commerce-account"><header className="commerce-account-top"><Link href="/" aria-label="Neverbe home"><BrandLogo/></Link><div><Link href="/collections/products">Back to shop <ArrowUpRight size={16}/></Link><ThemeToggle/></div></header><main id="main-content" className="commerce-account-main"><div className="commerce-page-heading"><p className="sport-eyebrow">YOUR OWN CORNER OF NEVERBE</p><h1>Hey, {user?.displayName?.split(" ")[0]||"you"}.</h1><p>Your details. Your orders. Your next move.</p></div><div className="commerce-account-layout"><aside><div className="commerce-account-member"><span>{user?.displayName?.charAt(0)||"N"}</span><div><strong>{user?.displayName||"Your account"}</strong><small>{user?.isAnonymous?"Guest account":"NEVERBE member"}</small></div></div><nav aria-label="Account sections">{tabs.map(tab=><button type="button" key={tab.id} aria-current={active===tab.id?"page":undefined} onClick={()=>setActive(tab.id)}><tab.icon size={18}/>{tab.label}</button>)}</nav><button type="button" className="commerce-signout" onClick={logout}><LogOut size={17}/> Sign out</button></aside><section className="commerce-account-panel" aria-label={tabs.find(t=>t.id===active)?.label}>{user?.isAnonymous&&<div className="commerce-notice"><p>Keep your guest order history by linking your account.</p><button type="button" onClick={linkGoogle}>Link with Google <ArrowUpRight size={15}/></button></div>}{failed&&<div className="commerce-notice" role="alert"><p>Some account details couldn’t be loaded.</p><button type="button" onClick={()=>setAttempt(n=>n+1)}>Try again</button></div>}{loading?<div className="commerce-loading"><Spinner/></div>:user&&<>{active==="dashboard"&&<ProfileOverview user={user} ordersCount={orders.length} setActiveTab={setActive}/>}{active==="orders"&&<OrdersView orders={orders}/>}{active==="addresses"&&<SavedAddresses addresses={addresses} setAddresses={setAddresses} user={user}/>}{active==="reviews"&&<ReCaptchaProviderWrapper><MyReviews/></ReCaptchaProviderWrapper>}{active==="details"&&<AccountSettings user={user} dispatch={dispatch}/>}</>}</section></div></main></div>;
}
