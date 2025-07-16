"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules"
import "@smastrom/react-rating/style.css";
import ReviewCard from "./ReviewCard";

export default function ReviewScroll() {
  const reviews = [
    {
      star: 5,
      message: "I was so worried about AI detection tools, but MyScholarHack helped me write essays that were 100% me.  I won $8000 in scholarships in 3 months!",
      username: "Courtney M. Senior",
      address: "Fort Worth, TX",
      profileImage: "/Courtney-M1.jpg"
    },
    {
      star: 5,
      message: "The voice matching is incredible. It actually sounds like I wrote it. I  went from avoiding essay scholarships to applying to 15 in one month.",
      username: "Marcus T",
      address: "High School Senior, Texas",
      profileImage: "/Marcus-T1.png"
    },
    {
      star: 5,
      message: "Finally, a tool that doesn't just spit out generic garbage. It helped me tell MY story, and I won my first scholarship!",
      username: "Priya K",
      address: "Sophomore, Northwestern",
      profileImage: "/Priya-K1.png"
    }
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="max-w-full mx-auto">
        <Swiper
          spaceBetween={20}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false,
          }}
          loop={false}
          modules={[Autoplay]}
          className="w-full"
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index}>
              <ReviewCard
                star={review.star}
                message={review.message}
                username={review.username}
                address={review.address}
                profileImage={review.profileImage}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
