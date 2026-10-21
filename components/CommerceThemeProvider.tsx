"use client";
import { useSyncExternalStore,type ReactNode } from "react";
import { ConfigProvider,theme } from "antd";
import Spinner from "./Spinner";
import { designTokens } from "@/config/theme";
function subscribe(callback:()=>void){const observer=new MutationObserver(callback);observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});return ()=>observer.disconnect();}
export default function CommerceThemeProvider({children}:{children:ReactNode}){
 const mode=useSyncExternalStore(subscribe,()=>document.documentElement.dataset.theme||"light",()=>"light");
 const dark=mode==="dark";const colors=dark?designTokens.dark:designTokens.light;
 return <ConfigProvider spin={{indicator:<Spinner/>}} theme={{algorithm:dark?theme.darkAlgorithm:theme.defaultAlgorithm,token:{colorPrimary:colors["v2-accent"],colorLink:colors["v2-text-primary"],colorLinkHover:colors["v2-text-secondary"],colorLinkActive:colors["v2-text-primary"],colorBgLayout:colors["v2-bg-void"],colorBgContainer:colors["v2-bg-surface"],colorText:colors["v2-text-primary"],colorTextSecondary:colors["v2-text-secondary"],colorBorder:colors["color-border-strong"],colorError:colors["color-error"],colorWarning:colors["color-warning"],colorSuccess:colors["color-success"],colorInfo:colors["color-info"],borderRadius:4,controlHeight:46,fontFamily:"Arial, Helvetica, sans-serif",fontSize:13},components:{Button:{borderRadius:30,controlHeight:46,fontWeight:600,primaryColor:colors["v2-accent-text"]},Modal:{borderRadiusLG:6},Drawer:{colorBgElevated:colors["v2-bg-void"]},Card:{borderRadiusLG:4},Input:{borderRadius:4},Select:{borderRadius:4},Pagination:{itemSize:40}}}}>{children}</ConfigProvider>;
}
