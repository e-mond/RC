// src/components/ui/FormInput.jsx
import React from "react";

export default function FormInput({
  id,
  label,
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  error,
  required = true,
  autoComplete,
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#0f1724] mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete || (type === "password" ? "current-password" : "off")}
        className={`w-full border rounded-lg px-3 py-2.5 text-base transition
          focus:ring-2 focus:outline-none
          ${error ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-[#0b6e4f]"}`}
      />

      {error && (
        <p className="text-red-600 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
