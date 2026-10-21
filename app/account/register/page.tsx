"use client";
import Spinner from "@/components/Spinner";
import { Suspense,useState,type FormEvent } from "react";
import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword,updateProfile,EmailAuthProvider,linkWithCredential } from "firebase/auth";
import { ArrowRight } from "lucide-react";
import { auth } from "@/firebase/firebaseClient";
import AuthShell from "@/components/AuthShell";
import toast from "react-hot-toast";
function RegisterForm(){
 const router=useRouter();const params=useSearchParams();const redirect=params.get("redirect")||"/account";const destination=redirect.startsWith("/")&&!redirect.startsWith("//")&&!redirect.includes("\\")?redirect:"/account";const [busy,setBusy]=useState(false);
 const register=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const data=new FormData(event.currentTarget);const email=String(data.get("email"));const password=String(data.get("password"));setBusy(true);try{const current=auth.currentUser;const credential=current?.isAnonymous?await linkWithCredential(current,EmailAuthProvider.credential(email,password)):await createUserWithEmailAndPassword(auth,email,password);await updateProfile(credential.user,{displayName:`${data.get("firstName")} ${data.get("lastName")}`.trim()});await credential.user.reload();toast.success("Welcome to NEVERBE.");router.push(destination);}catch{toast.error("We couldn’t create your account. Check your details or try signing in.");}finally{setBusy(false);}};
 return <AuthShell title="Make yourself at home." description="Keep your orders, saved addresses, and everyday essentials in one place."><form onSubmit={register} className="commerce-form"><div className="commerce-form-row"><label>First name<input name="firstName" autoComplete="given-name" required maxLength={80}/></label><label>Last name<input name="lastName" autoComplete="family-name" required maxLength={80}/></label></div><label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required/></label><label>Password<input type="password" name="password" autoComplete="new-password" minLength={6} required aria-describedby="password-hint"/><small id="password-hint">Use at least 6 characters.</small></label><button type="submit" className="commerce-primary" disabled={busy}>{busy?<Spinner/>:"Create account"}<ArrowRight size={17}/></button></form><p className="commerce-auth-switch">Already part of NEVERBE? <Link href={`/account/login?redirect=${encodeURIComponent(destination)}`}>Sign in</Link></p></AuthShell>;
}
export default function RegisterPage(){return <Suspense fallback={<div className="commerce-loading"><Spinner/></div>}><RegisterForm/></Suspense>;}
