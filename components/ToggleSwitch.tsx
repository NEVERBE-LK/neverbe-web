"use client";
export default function ToggleSwitch({checked,onChange,disabled=false,size="medium"}:{checked:boolean;onChange:(checked:boolean)=>void;disabled?:boolean;size?:"small"|"medium"}) {return <button type="button" className={`commerce-switch ${size}`} role="switch" aria-label="Toggle selection" aria-checked={checked} disabled={disabled} onClick={()=>onChange(!checked)}><span/></button>;}
