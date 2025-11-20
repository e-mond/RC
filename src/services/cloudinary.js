// src/services/cloudinary.js
/**
 * Cloudinary URL builder helper
 * - Expects environment: VITE_CLOUDINARY_BASE (e.g. https://res.cloudinary.com/<cloud-name>)
 * - publicId examples: "properties/apt_1/bedroom_01"
 * - options: { w: 1200, h: 800, crop: 'fill', q: 'auto', f: 'auto', dpr: 2 }
 *
 * Usage:
 *   buildCloudinaryUrl("properties/apt_1/bedroom_01", { w:1200, q:'auto' })
 */
const CLOUD_BASE = import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/demo";

export function serializeTransforms(opts = {}) {
  const parts = [];
  if (opts.w) parts.push(`w_${opts.w}`);
  if (opts.h) parts.push(`h_${opts.h}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.q) parts.push(`q_${opts.q}`);
  if (opts.f) parts.push(`f_${opts.f}`);
  if (opts.dpr) parts.push(`dpr_${opts.dpr}`);
  // allow any raw string transform via opts.raw
  if (opts.raw) parts.push(opts.raw);
  return parts.join(",");
}

/**
 * Build a Cloudinary URL given publicId and transform options
 * @param {string} publicId
 * @param {object} options
 * @returns {string}
 */
export function buildCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return "";
  const transforms = serializeTransforms(options);
  // ensure publicId doesn't have leading slash
  const pid = publicId.replace(/^\/+/, "");
  if (transforms) {
    return `${CLOUD_BASE}/image/upload/${transforms}/${pid}`;
  }
  return `${CLOUD_BASE}/image/upload/${pid}`;
}

export default buildCloudinaryUrl;
