// components/AboutSection.jsx
import React from "react";
import { FaHome } from "react-icons/fa";
import { HiOutlineLightBulb } from "react-icons/hi";
import { FaGem } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";



const AboutSection = ({ title, content, icon: Icon }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-2">
        {Icon && (
          <div className="text-teal-600 text-3xl">
            <Icon />
          </div>
        )}
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-700">{content}</p>
    </div>
  );
};

const AboutPage = () => {
  return (

    <div className="md:p-4 bg-[#E4FDE1]  p-6  ">
      <h1 className="text-4xl font-bold mb-6 text-teal-700">About Us</h1>
      
      <AboutSection
        icon={FaHome}
        title="Our Mission"
        content="To simplify the PG finding experience by offering a transparent and efficient platform for both PG seekers and owners."
      />

      <AboutSection
      icon={HiOutlineLightBulb}
        title="What We Offer"
        content="We offer verified listings, smart filters, direct communication with PG owners, and a mobile-friendly interface to help you find your perfect stay."
      />

      <AboutSection
      icon={FaGem}
        title="Why Choose Us?"
        content="With genuine reviews, a clean UI, and growing features like rent payments and digital agreements, we’re building the most trusted PG platform in India."
      />

      <AboutSection
        icon={FaEnvelope}
        title="Get in Touch"
        content="Reach us at support@findmypg.in — we’re here to help you find your perfect place to stay."
      />
    </div>
  );
};

export default AboutPage;


