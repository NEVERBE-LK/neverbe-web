"use client";
import { ReactNode, useEffect } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { initializeBag } from "@/redux/bagSlice/bagSlice";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Bag = dynamic(() => import("@/components/Bag"), { ssr: false });
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const Menu = dynamic(() => import("@/components/Menu"), { ssr: false });
import MobileCheckoutBar from "@/components/MobileCheckoutBar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NavigationItem, SocialMediaItem } from "@/actions/websiteAction";
import { PromotionsProvider } from "@/components/PromotionsProvider";
import QuickViewProvider from "@/components/QuickViewProvider";
import RecentlyViewedProvider from "@/components/RecentlyViewedProvider";

interface GlobalProviderProps {
  children: ReactNode;
  season: "christmas" | "newYear" | null;
  mainNav?: NavigationItem[];
  footerNav?: NavigationItem[];
  socialLinks?: SocialMediaItem[];
}

const GlobalProvider = ({
  children,
  season,
  mainNav = [],
  footerNav = [],
  socialLinks = [],
}: GlobalProviderProps) => {
  const dispatch: AppDispatch = useDispatch();

  const showBag = useSelector((state: RootState) => state.bag.showBag);
  const showMenu = useSelector(
    (state: RootState) => state.headerSlice.showMenu,
  );

  useEffect(() => {
    dispatch(initializeBag());
  }, [dispatch]);

  return (
    <div className="w-full relative flex flex-col flex-1 min-h-screen">
      <PromotionsProvider>
        <RecentlyViewedProvider>
          <QuickViewProvider>
            <Header season={season} mainNav={mainNav} />
            <main
              id="main-content"
              className="commerce-content flex-1 flex flex-col w-full"
            >
              {children}
            </main>
            <Footer footerNav={footerNav} socialLinks={socialLinks} />
            <AnimatePresence>{showBag && <Bag />}</AnimatePresence>
            <AnimatePresence>
              {showMenu && <Menu mainNav={mainNav} />}
            </AnimatePresence>
            <MobileCheckoutBar />
            <Analytics />
            <SpeedInsights />
          </QuickViewProvider>
        </RecentlyViewedProvider>
      </PromotionsProvider>
    </div>
  );
};

export default GlobalProvider;
