import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Image as ImageIcon, X } from "lucide-react";

function ImageUploader({
  imageInputRef,
  onImageChange,
  onUpload,
  imageData,
  isUploadingImage,
}) {
  return (
    <div className="space-y-2 flex align-items-center gap-4">
      <div className="flex gap-2 items-center ">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2 px-3"
        >
          <Input
            ref={imageInputRef}
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
          <label
            htmlFor="image"
            type="button"
            className="flex flex-row gap-2 align-items-center items-center"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm text-muted-foreground ">
              {imageData ? "Change" : "Upload Image"}
            </span>
          </label>
        </Button>
        <Button
          type="button"
          disabled={isUploadingImage || !imageData}
          onClick={onUpload}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isUploadingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isUploadingImage ? "Uploading..." : "Confirm Upload"}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default ImageUploader;