"use client";
import { Pagination as Pager } from "antd";
export default function Pagination({count,page,onChange}:{count:number;page:number;onChange:(page:number)=>void;siblingCount?:number}){if(count<=1)return null;return <div className="commerce-pagination"><Pager current={page} total={count} pageSize={1} onChange={onChange} showSizeChanger={false} showLessItems responsive/></div>;}
