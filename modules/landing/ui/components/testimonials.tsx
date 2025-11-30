"use client";

import React, { useEffect } from "react";
import Slider from "react-slick";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { CardBox } from "@/shared/ui";
import AOS from "aos";
import "aos/dist/aos.css";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import review1 from "@/public/images/profile/user-2.jpg";
import review2 from "@/public/images/profile/user-3.jpg";
import review3 from "@/public/images/profile/user-4.jpg";

const reviews = [
  {
    img: review1,
    name: "Sarah M.",
    subtitle: "Calculus 1 Student",
    reviewKey: "reviews.0.text",
    rating: 5,
  },
  {
    img: review2,
    name: "David K.",
    subtitle: "Linear Algebra Student",
    reviewKey: "reviews.1.text",
    rating: 5,
  },
  {
    img: review3,
    name: "Yael B.",
    subtitle: "Physics 1 Student",
    reviewKey: "reviews.2.text",
    rating: 5,
  },
  {
    img: review1,
    name: "Michael R.",
    subtitle: "Calculus 1 Student",
    reviewKey: "reviews.3.text",
    rating: 5,
  },
  {
    img: review2,
    name: "Noam S.",
    subtitle: "Linear Algebra Student",
    reviewKey: "reviews.4.text",
    rating: 5,
  },
  {
    img: review3,
    name: "Amit L.",
    subtitle: "Calculus 1 Student",
    reviewKey: "reviews.5.text",
    rating: 5,
  },
];

export const Testimonials = () => {
  const t = useTranslations("landing.testimonials");

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const settings = {
    className: "center",
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    swipeToSlide: true,
    dots: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 md:py-20 py-12">
        {/* Section Header */}
        <div
          className="lg:w-3/5 w-full mx-auto"
          data-aos="fade-up"
          data-aos-duration="500"
        >
          <p
            className="text-center text-sm font-medium text-primary-600 uppercase tracking-wider mb-3"
            data-aos="fade-up"
            data-aos-delay="100"
            data-aos-duration="1000"
          >
            {t("badge")}
          </p>
          <h2
            className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white sm:leading-[45px]"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t("title")}
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div
          className="slider-container client-reviews pt-14"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="1000"
        >
          <Slider {...settings}>
            {reviews.map((item, index) => (
              <div key={index}>
                <CardBox className="bg-gray-50 dark:bg-zinc-900 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <Image
                        src={item.img}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                      <div>
                        <h6 className="text-base font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h6>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="ms-auto flex gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Icon
                          key={i}
                          icon="tabler:star-filled"
                          className="text-warning-500"
                          height={16}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pt-4 leading-relaxed">
                    {t(item.reviewKey)}
                  </p>
                </CardBox>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};
