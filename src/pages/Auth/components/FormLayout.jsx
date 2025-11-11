import React from "react";
import { Link } from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

export default function FormLayout({ role, children }) {

  const roleInfo = {
    landlord: {
      title: "Create Your Landlord Account",
      tagline: "List properties confidently and manage tenants easily.",
      image: "/assets/images/login-landlord.jpg",
    },
    tenant: {
      title: "Join as a Tenant",
      tagline: "Build your trusted digital rental profile.",
      image: "/assets/images/login-tenant.jpg",
    },
    artisan: {
      title: "Sign Up as an Artisan",
      tagline: "Connect with verified clients and grow your business.",
      image: "/assets/images/login-artisan.jpg",
    },
  };

  const { title, tagline, image } = roleInfo[role] || {};

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f9fafb]">

      {/* --- LEFT FORM SECTION --- */}
      <div className="md:w-3/5 flex flex-col px-6 sm:px-10 py-10 justify-center">

        {/* Buttons positioned top right */}
        <div className="flex justify-end gap-3 mb-6">
          <SecondaryButton as={Link} to="/">← Home</SecondaryButton>
          <PrimaryButton as={Link} to="/role-selection">Role Selection</PrimaryButton>
        </div>

        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f1724]">{title}</h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg leading-relaxed">
            {tagline}
          </p>

          {/* Form container */}
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-100 mt-6">
            {children}
          </div>
        </div>

      </div>

      {/* --- RIGHT IMAGE SECTION --- */}
      <div className="md:w-2/5 h-[200px] md:h-full relative">
        <img
          src={image}
          alt={`${role} signup`}
          className="w-full h-full object-cover object-center rounded-l-2xl md:rounded-none"
        />
        <div className="absolute inset-0 bg-black/15"></div>
      </div>

    </div>
  );
}
