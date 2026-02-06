import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, ImageIcon, Check } from "lucide-react";

function ImageUploader({
  imageInputRef,
  onImageChange,
  onUpload,
  imageData,
  isUploadingImage,
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Hidden file input */}
      <Input
        ref={imageInputRef}
        id="image-upload"
        type="file"
        name="image"
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
      />
      
      {/* Select Image Button */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        asChild
        className="h-9 px-3"
      >
        <label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs">
            {imageData ? "Change" : "Select"}
          </span>
        </label>
      </Button>

      {/* Upload Button */}
      <Button
        type="button"
        disabled={isUploadingImage || !imageData}
        onClick={onUpload}
        size="sm"
        variant={imageData ? "default" : "outline"}
        className="h-9 px-3"
      >
        {isUploadingImage ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">Uploading...</span>
          </>
        ) : imageData ? (
          <>
            <Upload className="h-4 w-4 mr-2" />
            <span className="text-xs">Upload</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            <span className="text-xs">Upload</span>
          </>
        )}
      </Button>

      {/* Image selected indicator */}
      {imageData && !isUploadingImage && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Check className="h-3 w-3" />
          <span className="hidden sm:inline">Ready</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;