// src/components/landlord/ImageUploader.jsx
import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/services/propertyService";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced ImageUploader with drag-drop, preview, and better UX
 * 
 * Props:
 *  - value: array of image URLs or File objects
 *  - onChange: (urls) => void
 *  - multiple: boolean (default: true)
 *  - maxFiles: number (default: 10)
 *  - maxSizeMB: number (default: 5)
 */
export default function ImageUploader({
  value = [],
  onChange = () => {},
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 5,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }
    return true;
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const currentCount = value.length;
    const remainingSlots = maxFiles - currentCount;

    if (fileArray.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const uploaded = [];
      const existingUrls = value.filter((img) => typeof img === "string");

      // Upload files sequentially with progress indication
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
          validateFile(file);
          setUploadingIndex(i);
          const res = await uploadImage(file);
          const url = res?.url ?? res;
          uploaded.push(url);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          setError(err.message || `Failed to upload ${file.name}`);
          // Continue with other files
        }
      }

      setUploadingIndex(null);

      // Merge with existing
      const next = multiple ? [...existingUrls, ...uploaded] : uploaded;
      onChange(next);
    } catch (err) {
      console.error("Image upload error", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files) handleFiles(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const getImageUrl = (img) => {
    if (typeof img === "string") return img;
    if (img instanceof File) return URL.createObjectURL(img);
    return null;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Property Photos</label>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            dragging
              ? "border-[#0b6e4f] bg-[#0b6e4f]/5"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="image-upload-input"
        />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[#0b6e4f] animate-spin" />
              <p className="text-sm text-gray-600">
                Uploading {uploadingIndex !== null ? `(${uploadingIndex + 1})` : ""}...
              </p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400" />
              <div>
                <label
                  htmlFor="image-upload-input"
                  className="cursor-pointer text-[#0b6e4f] hover:text-[#095c42] font-medium"
                >
                  Click to upload
                </label>
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSizeMB}MB (max {maxFiles} images)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {value && value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {value.map((img, index) => {
              const url = getImageUrl(img);
              if (!url) return null;

              return (
                <motion.div
                  key={`${url}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#0b6e4f] text-white text-xs rounded">
                      Main
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Progress Info */}
      {uploading && uploadingIndex !== null && (
        <div className="text-sm text-gray-600 text-center">
          Uploading image {uploadingIndex + 1} of {value.length + uploadingIndex + 1}...
        </div>
      )}
    </div>
  );
}
