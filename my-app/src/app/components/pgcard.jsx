"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

export default function PgCard({ pg, bookingStatus, handleBooking }) {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 2500 }}
        slidesPerView={1}
        className="w-full h-52"
      >
        {pg.images.map((img, i) => (
          <SwiperSlide key={i}>
            <img src={img} className="w-full h-full object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="p-4">
        <h2 className="text-xl font-bold hover:text-teal-600">{pg.name}</h2>
        <p className="text-sm text-gray-500">{pg.address.city}</p>
        <p className="text-lg font-semibold text-green-600">₹{pg.rent}/month</p>
        <p className="text-sm">Gender Allowed: {pg.genderAllowed}</p>
        <p className="text-sm mb-3">
          <strong>Amenities:</strong> {pg.amenities.join(", ")}
        </p>

        <button
          id={`book-${pg._id}`}
          className={`w-full py-2 rounded-md ${
            bookingStatus ? "bg-gray-300 cursor-not-allowed" : "bg-teal-600 text-white"
          }`}
          onClick={() => handleBooking(pg)}
          data-tooltip-id={`book-${pg._id}`}
          data-tooltip-content={
            bookingStatus
              ? bookingStatus.rejectionReason || "Booking already exists"
              : "Click to book"
          }
        >
          {bookingStatus ? bookingStatus.status : "Book Now"}
        </button>

        <ReactTooltip id={`book-${pg._id}`} place="top" />
      </div>
    </div>
  );
}
