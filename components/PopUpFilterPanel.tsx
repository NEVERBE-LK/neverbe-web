"use client";
import { Drawer } from "antd";
import { X } from "lucide-react";
import FilterPanel, { type FilterPanelProps } from "./FilterPanel";
export default function PopUpFilterPanel({onClose,...props}:FilterPanelProps & {onClose:()=>void}) {
 return <Drawer open onClose={onClose} placement="right" size={420} closable={false} rootClassName="commerce-drawer commerce-filter-drawer" styles={{wrapper:{maxWidth:"100vw"},body:{padding:0}}}><div className="commerce-drawer-heading"><div><p className="sport-eyebrow">MAKE IT YOURS</p><h2>Filter & discover.</h2></div><button type="button" className="sport-icon" onClick={onClose} aria-label="Close filters"><X size={22}/></button></div><div className="commerce-drawer-scroll"><FilterPanel {...props}/></div><div className="commerce-drawer-footer"><button className="commerce-primary" type="button" onClick={onClose}>View results</button><p>Filters are applied as you select them.</p></div></Drawer>;
}
