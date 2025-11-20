// src/utils/propertyValidation.js
import { z } from "zod";

/**
 * Property Form Validation Schema
 * Used with react-hook-form + zod resolver
 */
export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z.string().optional(),
  address: z.string().min(5, "Address is required").max(500, "Address too long"),
  city: z.string().min(2, "City is required").optional(),
  region: z.string().optional(),
  country: z.string().default("Ghana"),
  
  // Pricing
  price: z.coerce.number().positive("Price must be positive"),
  currency: z.enum(["GHS", "USD"]).default("GHS"),
  deposit: z.coerce.number().min(0, "Deposit cannot be negative").optional(),
  
  // Property details
  bedrooms: z.coerce.number().int().min(0, "Bedrooms cannot be negative").max(20),
  bathrooms: z.coerce.number().int().min(0, "Bathrooms cannot be negative").max(20),
  area: z.coerce.number().positive("Area must be positive").optional(),
  area_sqm: z.coerce.number().positive("Area must be positive").optional(),
  
  // Property type
  property_type: z.enum(["apartment", "house", "studio", "room", "commercial", "land"]).default("apartment"),
  
  // Status
  status: z.enum(["draft", "pending", "active", "suspended", "rented", "unavailable"]).default("draft"),
  
  // Location
  lat: z.coerce.number().min(-90).max(90).optional().or(z.string().optional()),
  lng: z.coerce.number().min(-180).max(180).optional().or(z.string().optional()),
  
  // Arrays
  amenities: z.array(z.union([z.string(), z.object({ id: z.string(), name: z.string() })])).default([]),
  images: z.array(z.union([z.string(), z.instanceof(File)])).min(1, "At least one image is required").default([]),
});

// PropertyFormData type can be inferred from schema when using TypeScript

