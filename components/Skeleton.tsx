import Spinner from "./Spinner";
import type { ComponentType } from "react";
const Loading = () => <div className="commerce-loader"><Spinner/></div>;
export const Skeleton: ComponentType<{className?:string;variant?:"default"|"shimmer";count?:number}> = Loading;
export const ProductCardSkeleton: ComponentType<{className?:string;variant?:"default"|"shimmer";count?:number}> = Loading;
export const ProductGridSkeleton: ComponentType<{className?:string;variant?:"default"|"shimmer";count?:number}> = Loading;
export const SearchResultSkeleton: ComponentType<{className?:string;variant?:"default"|"shimmer";count?:number}> = Loading;
export const PageBlueprintSkeleton: ComponentType<{className?:string;variant?:"default"|"shimmer";count?:number}> = Loading;
export default Skeleton;
