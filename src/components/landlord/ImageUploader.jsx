/**
 * Enhanced Image Uploader with better debugging, local preview & robust URL handling
 * 
 * @param {Object} props
 * @param {Array<string|File>} props.value - Current images (URLs or File objects)
 * @param {Function} props.onChange - Callback with new array of image URLs
 * @param {boolean} [props.multiple=true]
 * @param {number} [props.maxFiles=10]
 * @param {number} [props.maxSizeMB=10]
 */
import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2, AlertTriangle } from "lucide-react";
import { uploadImage } from "@/services/propertyService";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageUploader({
  value = [],
  onChange = () => {},
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // file name → status
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const objectUrlsRef = useRef(new Map()); // for cleanup

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    const currentRef = objectUrlsRef.current;
    return () => {
      currentRef.forEach(URL.revokeObjectURL);
      currentRef.clear();
    };
  }, []);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed (jpg, png, webp, gif)");
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File too large. Maximum ${maxSizeMB}MB allowed`);
    }
    return true;
  };

  const getLocalPreview = (file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.set(file.name + Date.now(), url); // unique key
    return url;
  };

  const handleFiles = async (files) => {
    if (!files?.length) return;

    const fileArray = Array.from(files);
    const currentCount = value.filter((v) => v).length;
    const remaining = maxFiles - currentCount;

    if (fileArray.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining !== 1 ? 's' : ''}`);
      return;
    }

    setError("");
    setUploading(true);

    const newItems = [];
    const uploadErrors = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileKey = `${file.name}-${i}-${Date.now()}`;

      try {
        validateFile(file);

        // Show local preview immediately
        const previewUrl = getLocalPreview(file);
        newItems.push({
          file,
          previewUrl,
          status: "uploading",
          name: file.name,
        });

        // Update UI with uploading state
        setUploadProgress((prev) => ({ ...prev, [fileKey]: "uploading" }));

        console.log(`[ImageUploader] Starting upload → ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        const response = await uploadImage(file);

        console.log(`[ImageUploader] Upload response for ${file.name}:`, response);
        console.log(`[ImageUploader] Response type:`, typeof response);

        // ── Robust URL extraction ─────────────────────────────────────────────
        let uploadedUrl;

        if (typeof response === "string") {
          uploadedUrl = response;
        } else if (response && typeof response === "object") {
          uploadedUrl =
            response.url ||
            response.secure_url ||
            response.image_url ||
            response.location ||
            response.path ||
            response.data?.url ||
            response.data?.secure_url;
        }

        if (!uploadedUrl || typeof uploadedUrl !== "string" || !uploadedUrl.startsWith("http")) {
          throw new Error("No valid image URL returned from server");
        }

        console.log(`[ImageUploader] Successfully extracted URL:`, uploadedUrl);

        // Replace preview with real URL
        newItems[i] = uploadedUrl;
        setUploadProgress((prev) => ({ ...prev, [fileKey]: "success" }));

      } catch (err) {
        console.error(`[ImageUploader] Upload failed for ${file.name}:`, err);
        uploadErrors.push(`${file.name}: ${err.message || "Upload failed"}`);
        setUploadProgress((prev) => ({ ...prev, [fileKey]: "error" }));
      }
    }

    setUploading(false);
    setUploadProgress({});

    if (uploadErrors.length > 0) {
      setError(
        uploadErrors.length === fileArray.length
          ? `All uploads failed:\n${uploadErrors.join("\n")}`
          : `Partial success — some failed:\n${uploadErrors.join("\n")}`
      );
    }

    // Only keep successful uploads + existing valid URLs
    const existingValidUrls = value.filter((v) => typeof v === "string" && v.startsWith("http"));
    const successfulNewUrls = newItems.filter((item) => typeof item === "string");

    if (successfulNewUrls.length > 0 || existingValidUrls.length > 0) {
      const updated = multiple ? [...existingValidUrls, ...successfulNewUrls] : successfulNewUrls;
      console.log(`[ImageUploader] Final images array length: ${updated.length}`);
      onChange(updated);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    e.target.value = ""; // reset input
  };

  const removeImage = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    if (newValue.length === 0) setError("");
  };

  const getDisplayUrl = (item, index) => {
    if (typeof item === "string") return item;
    if (item?.previewUrl) return item.previewUrl;
    return null;
  };

  const isUploadingItem = (index) => {
    return value[index]?.status === "uploading" || uploadProgress[index] === "uploading";
  };

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────────
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer?.items?.length) setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
          Property Photos <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {value.length} / {maxFiles}
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center transition-all
          ${dragging 
            ? "border-green-500 bg-green-50/50 dark:bg-green-950/30" 
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900/40"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="property-image-upload"
        />

        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
              <p className="text-gray-700 dark:text-gray-300">Uploading images...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="space-y-1">
                <label
                  htmlFor="property-image-upload"
                  className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
                >
                  Click to select
                </label>
                <span className="text-gray-500"> or drag & drop images here</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supported: JPG, PNG, WebP, GIF • Max {maxSizeMB}MB per image
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 whitespace-pre-line">{error}</div>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {value.map((item, index) => {
              const url = getDisplayUrl(item, index);
              if (!url) return null;

              const isUploading = isUploadingItem(index);

              return (
                <motion.div
                  key={`${url}-${index}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <img
                    src={url}
                    alt={`Property preview ${index + 1}`}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isUploading ? "opacity-60" : ""}`}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x400/333/fff?text=Image+Error";
                    }}
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isUploading}
                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 disabled:opacity-40"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>

                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded-md shadow">
                      Cover Photo
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}