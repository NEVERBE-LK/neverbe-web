"use client";
import Spinner from "@/components/Spinner";
import { Suspense,useState,type FormEvent } from "react";
import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword } from "firebase/auth";
import { Modal } from "antd";
import { ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { auth } from "@/firebase/firebaseClient";
import { sendPasswordResetLinkAction } from "@/actions/authAction";
import AuthShell from "@/components/AuthShell";
import toast from "react-hot-toast";
function LoginForm(){
 const router=useRouter();const params=useSearchParams();const redirect=params.get("redirect")||"/account";const destination=redirect.startsWith("/")&&!redirect.startsWith("//")&&!redirect.includes("\\")?redirect:"/account";
 const [busy,setBusy]=useState(false);const [resetOpen,setResetOpen]=useState(false);const [resetBusy,setResetBusy]=useState(false);
 const login=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const data=new FormData(event.currentTarget);setBusy(true);try{await signInWithEmailAndPassword(auth,String(data.get("email")),String(data.get("password")));router.push(destination);}catch{toast.error("We couldn’t sign you in. Check your email and password.");}finally{setBusy(false);}};
 const google=async()=>{setBusy(true);try{await signInWithPopup(auth,new GoogleAuthProvider());router.push(destination);}catch{toast.error("Google sign-in was not completed. Please try again.");}finally{setBusy(false);}};
 const reset=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const data=new FormData(event.currentTarget);setResetBusy(true);try{await sendPasswordResetLinkAction(String(data.get("email")));toast.success("If an account exists, a reset link will be sent.");setResetOpen(false);}catch{toast.error("We couldn’t send the reset link. Please try again.");}finally{setResetBusy(false);}};
 return <AuthShell title="Good to see you again." description="Sign in to track your orders, save your details, and get back to what moves you."><button type="button" className="commerce-google" onClick={google} disabled={busy}><FcGoogle size={21}/> Continue with Google</button><div className="commerce-form-divider"><span>or sign in with email</span></div><form onSubmit={login} className="commerce-form"><label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required/></label><label>Password<input type="password" name="password" autoComplete="current-password" placeholder="Your password" required/></label><button type="button" className="commerce-forgot" onClick={()=>setResetOpen(true)}>Forgot your password?</button><button type="submit" className="commerce-primary" disabled={busy}>{busy?<Spinner/>:"Sign in"}<ArrowRight size={17}/></button></form><p className="commerce-auth-switch">New to NEVERBE? <Link href={`/account/register?redirect=${encodeURIComponent(destination)}`}>Create an account</Link></p><Modal open={resetOpen} onCancel={()=>setResetOpen(false)} footer={null} title="Reset your password" centered rootClassName="commerce-modal"><p>Enter your email and we’ll help you get back in.</p><form className="commerce-form" onSubmit={reset}><label>Email address<input type="email" name="email" autoComplete="email" required/></label><button type="submit" className="commerce-primary" disabled={resetBusy}>{resetBusy?<Spinner/>:"Send reset link"}</button></form></Modal></AuthShell>;
}
export default function LoginPage(){return <Suspense fallback={<div className="commerce-loading"><Spinner/></div>}><LoginForm/></Suspense>;}
