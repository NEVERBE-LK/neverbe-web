"use client";

import BrandLogo from "@/components/BrandLogo";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ShoppingBag,
  Menu,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { showBag } from "@/redux/bagSlice/bagSlice";
import { toggleMenu } from "@/redux/headerSlice/headerSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import type { NavigationItem } from "@/actions/websiteAction";
import ThemeToggle from "@/components/ThemeToggle";

const defaults: NavigationItem[] = [
  { title: "New arrivals", link: "/collections/new-arrivals" },
  { title: "Men", link: "/collections/products?gender=men" },
  { title: "Women", link: "/collections/products?gender=women" },
  { title: "Explore", link: "/collections/products" },
  { title: "Offers", link: "/collections/offers" },
];

export default function Header({
  mainNav = [],
}: {
  season: "christmas" | "newYear" | null;
  mainNav?: NavigationItem[];
}) {
  const dispatch = useDispatch<AppDispatch>();
  const bag = useSelector((state: RootState) => state.bag.bag);
  const menuOpen = useSelector(
    (state: RootState) => state.headerSlice.showMenu,
  );
  const pathname = usePathname();
  const links = mainNav.length ? mainNav : defaults;
  return (
    <header className="sport-header">
      <div className="sport-announcement">
        <span>Made for your every move.</span>
        <Link href="/policies/shipping-return-policy">
          Island-wide delivery · Sri Lanka <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="sport-nav">
        <Link href="/" className="sport-wordmark" aria-label="Neverbe home">
          <BrandLogo />
        </Link>
        <nav className="sport-desktop-nav" aria-label="Main navigation">
          {links.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              aria-current={pathname === item.link ? "page" : undefined}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="sport-nav-actions">
          <form action="/search" role="search" className="sport-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              name="q"
              aria-label="Search products"
              placeholder="Find your next move"
              required
            />
          </form>
          <Link
            href="/search"
            className="sport-icon sport-mobile-search"
            aria-label="Search products"
          >
            <Search size={21} />
          </Link>
          <ThemeToggle className="sport-nav-theme" />
          <Link
            href="/account"
            className="sport-icon sport-account"
            aria-label="Your account"
          >
            <UserRound size={21} />
          </Link>
          <button
            type="button"
            className="sport-icon sport-bag"
            onClick={() => dispatch(showBag())}
            aria-label={`Open shopping bag, ${bag.length} items`}
          >
            <ShoppingBag size={21} />
            {bag.length > 0 && <span>{bag.length}</span>}
          </button>
          <button
            type="button"
            className="sport-icon sport-mobile-menu"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => dispatch(toggleMenu(true))}
          >
            <Menu size={23} />
          </button>
        </div>
      </div>
      <nav className="sport-mobile-links" aria-label="Quick shop">
        {links.map((item) => (
          <Link href={item.link} key={item.link}>
            {item.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
