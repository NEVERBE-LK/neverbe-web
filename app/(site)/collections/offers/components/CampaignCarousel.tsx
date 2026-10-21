"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Button, Typography, Flex } from "antd";
import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";

const { Title, Text } = Typography;

interface CampaignCarouselProps {
  promotions: any[];
}

const CampaignCarousel: React.FC<CampaignCarouselProps> = ({ promotions }) => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (!promotions || promotions.length === 0) return null;

  const getPromoUrl = (promo: any) => {
    if (promo.applicableCategories && promo.applicableCategories.length > 0) {
      return `/collections/products?category=${encodeURIComponent(promo.applicableCategories[0])}`;
    }
    if (promo.applicableBrands && promo.applicableBrands.length > 0) {
      return `/collections/products?brand=${encodeURIComponent(promo.applicableBrands[0])}`;
    }
    return `/collections/products`;
  };

  return (
    <section>
      <Flex align="center" justify="space-between" className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-primary m-0">
          Active Campaigns
        </p>
        <Flex align="center" gap={8} className="hidden md:flex">
          <Button
            ref={prevRef}
            shape="circle"
            icon={<LeftOutlined style={{ fontSize: 12 }} />}
            className="w-8 h-8 flex items-center justify-center hover:border-accent! hover:text-accent!"
          />
          <Button
            ref={nextRef}
            shape="circle"
            icon={<RightOutlined style={{ fontSize: 12 }} />}
            className="w-8 h-8 flex items-center justify-center hover:border-accent! hover:text-accent!"
          />
        </Flex>
      </Flex>

      <div className="relative pb-4">
        <Swiper
          modules={[Navigation]}
          onInit={(s) => {
            if (
              s.params.navigation &&
              typeof s.params.navigation !== "boolean"
            ) {
              s.params.navigation.prevEl = prevRef.current;
              s.params.navigation.nextEl = nextRef.current;
              s.navigation.init();
              s.navigation.update();
            }
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            768: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3 },
          }}
          className="overflow-visible!"
        >
          {promotions.map((promo: any) => (
            <SwiperSlide key={promo.id}>
              <Link href={getPromoUrl(promo)} passHref>
                <div
                  className="group block relative bg-surface-3 overflow-hidden cursor-pointer rounded-[24px] hover:shadow-lg transition-all aspect-[16/9] md:aspect-[4/5]"
                >
                  <Image
                    src={promo.bannerUrl}
                    alt={promo.name}
                    fill
                    className="object-contain md:object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-white text-lg font-black uppercase tracking-tight mb-3">
                      {promo.name}
                    </h3>
                    <Button
                      style={{
                        borderRadius: 99,
                        background: "var(--color-white)",
                        color: "var(--color-ink)",
                        border: "none",
                        fontWeight: 800,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        height: 36,
                        padding: "0 20px",
                      }}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CampaignCarousel;
