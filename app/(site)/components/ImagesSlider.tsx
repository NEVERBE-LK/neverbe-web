"use client";
import Image from "next/image";
import { Slide } from "@/interfaces/Slide";
import { Carousel } from "antd";
import { forwardRef } from "react";
import type { CarouselRef } from "antd/es/carousel";

interface ImagesSliderProps {
  images: Slide[];
  afterChange?: (current: number) => void;
}

const ImagesSlider = forwardRef<CarouselRef, ImagesSliderProps>(
  ({ images, afterChange }, ref) => {
    return (
      <Carousel
        ref={ref}
        autoplay
        autoplaySpeed={6000}
        dots={false}
        effect="fade"
        afterChange={afterChange}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="w-full h-full bg-surface block overflow-hidden rounded-[24px]"
          >
            <div className="relative w-full h-[40vh] md:h-[75vh] bg-surface rounded-[24px] overflow-hidden">
              <Image
                src={image.url}
                alt="Neverbe Hero"
                fill
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </Carousel>
    );
  },
);

ImagesSlider.displayName = "ImagesSlider";

export default ImagesSlider;
