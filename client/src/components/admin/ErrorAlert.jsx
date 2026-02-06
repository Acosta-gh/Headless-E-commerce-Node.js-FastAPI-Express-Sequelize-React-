import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function ErrorAlert({ tempIdError, articleError, imageError }) {
  const errors = [
    tempIdError && { label: "TempID", message: tempIdError.message },
    articleError && { label: "Article", message: articleError.message },
    imageError && { label: "Image", message: imageError.message },
  ].filter(Boolean);

  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="ml-2">
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="text-sm">
              <span className="font-semibold">{error.label}:</span> {error.message}
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default ErrorAlert;