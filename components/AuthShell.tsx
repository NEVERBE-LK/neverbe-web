import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
export default function AuthShell({title,description,children}:{title:string;description:string;children:ReactNode}) {
 return <main className="commerce-auth" id="main-content"><div className="commerce-auth-visual"><Image src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80" alt="Runners exploring an outdoor trail" fill sizes="(max-width:900px) 0px, 50vw"/><div><p className="sport-eyebrow">NEVER ORDINARY. ALWAYS YOU.</p><h2>YOUR PACE.<br/>YOUR PEOPLE.<br/><em>YOUR NEVERBE.</em></h2><p>Good gear for every version of you.</p></div></div><div className="commerce-auth-panel"><div className="commerce-auth-top"><Link href="/" aria-label="Neverbe home"><BrandLogo/></Link><ThemeToggle/></div><div className="commerce-auth-form"><p className="sport-eyebrow">THE NEXT MOVE IS YOURS</p><h1>{title}</h1><p className="commerce-auth-description">{description}</p>{children}</div><div className="commerce-auth-bottom"><Link href="/policies/privacy-policy">Privacy</Link><Link href="/contact">Need a hand?</Link><span>Sri Lanka · LKR</span></div></div></main>;
}
