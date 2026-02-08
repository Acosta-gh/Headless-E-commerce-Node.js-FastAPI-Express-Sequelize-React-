import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, ImageIcon, Check, X } from "lucide-react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/components/Constants";

/**
 * GalleryUploader - Upload multiple images with thumbnails
 * Supports both new uploads and displaying existing gallery images
 * 
 * @param {Function} uploadNewImage - From useImage hook
 * @param {string} tempId - Temporary ID
 * @param {string} tempIdToken - Token for uploads
 * @param {boolean} isUploading - Loading state
 * @param {Array} existingImages - Existing gallery images from article
 * @param {Function} onComplete - Callback after upload
 */
function GalleryUploader({ 
  uploadNewImage, 
  tempId, 
  tempIdToken, 
  isUploading, 
  existingImages = [],
  onComplete 
}) {
  const inputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]); // { file, preview, id, status }
  const [uploading, setUploading] = useState(false);

  // Initialize with existing images when editing
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const existing = existingImages.map((img) => ({
        id: `existing-${img.id}`,
        url: img.url,
        preview: `${BACKEND_URL}${img.url}`,
        status: "success", // Mark as already uploaded
        isExisting: true,
        originalId: img.id,
      }));
      setSelectedImages((prev) => [...existing, ...prev.filter(p => !p.isExisting)]);
    }
  }, []);

  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random()}`,
      status: "pending",
      isExisting: false,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Remove image from selection
  const removeImage = (id) => {
    setSelectedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.preview && !image.isExisting) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Upload all NEW selected images
  const handleUpload = async () => {
    const imagesToUpload = selectedImages.filter(
      (img) => img.status === "pending"
    );

    if (!imagesToUpload.length) {
      toast.info("No new images to upload");
      return;
    }

    if (!tempId || !tempIdToken) {
      toast.error("Session not ready");
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (const imageObj of imagesToUpload) {
      try {
        // Update status to uploading
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.id === imageObj.id ? { ...img, status: "uploading" } : img
          )
        );

        // Create FormData with image and tempId
        const formData = new FormData();
        formData.append("image", imageObj.file);
        formData.append("tempId", tempId);
        formData.append("type", "gallery");

        // Upload
        await uploadNewImage(formData, tempIdToken);

        // Update status to success
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.id === imageObj.id ? { ...img, status: "success" } : img
          )
        );
        successCount++;
      } catch (error) {
        // Update status to error
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.id === imageObj.id ? { ...img, status: "error" } : img
          )
        );
        toast.error(`Failed to upload ${imageObj.file.name}`);
      }
    }

    setUploading(false);

    // Show result
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? "s" : ""} uploaded`);
    }

    onComplete?.();
  };

  const isDisabled = isUploading || uploading;
  const pendingImages = selectedImages.filter((img) => img.status === "pending");

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          id="gallery-upload"
          type="file"
          name="gallery"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
          disabled={isDisabled}
        />

        {/* Select Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          asChild
          className="h-9 px-3"
          disabled={isDisabled}
        >
          <label htmlFor="gallery-upload" className="cursor-pointer flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">
              {selectedImages.length > 0 ? "Add more" : "Select"}
            </span>
          </label>
        </Button>

        {/* Upload Button - Only show if there are pending images */}
        {pendingImages.length > 0 && (
          <Button
            type="button"
            disabled={isDisabled || !pendingImages.length}
            onClick={handleUpload}
            size="sm"
            variant="default"
            className="h-9 px-3"
          >
            {isDisabled || uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-xs">Upload ({pendingImages.length})</span>
              </>
            )}
          </Button>
        )}

        {/* Counter */}
        {selectedImages.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""}
            {pendingImages.length > 0 && ` (${pendingImages.length} new)`}
          </span>
        )}

        {/* Ready indicator */}
        {selectedImages.every((img) => img.status === "success") && 
          selectedImages.length > 0 && 
          !isDisabled && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" />
            <span className="hidden sm:inline">Done</span>
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {selectedImages.map((image) => (
            <div
              key={image.id}
              className="relative group rounded border overflow-hidden bg-slate-100"
            >
              {/* Thumbnail */}
              <img
                src={image.preview}
                alt="gallery thumbnail"
                className={`w-full h-24 object-cover transition-opacity ${
                  image.status === "success" || image.status === "error"
                    ? "opacity-50"
                    : ""
                }`}
              />

              {/* Existing Badge */}
              {image.isExisting && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                  Existing
                </div>
              )}

              {/* Status overlay */}
              {image.status === "uploading" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}

              {image.status === "success" && !image.isExisting && (
                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              )}

              {image.status === "error" && (
                <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                disabled={image.status === "uploading"}
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-60 group-hover:opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                title={image.isExisting ? "Remove from gallery" : "Remove image"}
              >
                <X className="h-3 w-3" />
              </button>

              {/* File name on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-1 pointer-events-none">
                <p className="text-xs text-white opacity-0 group-hover:opacity-100 truncate max-w-full">
                  {image.file?.name || "Existing image"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GalleryUploader;