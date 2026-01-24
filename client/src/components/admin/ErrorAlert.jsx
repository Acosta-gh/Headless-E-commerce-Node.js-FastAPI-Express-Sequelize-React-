import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function ErrorAlert({ tempIdError, articleError, imageError }) {
  if (!tempIdError && !articleError && !imageError) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {tempIdError && <div>TempID: {tempIdError.message}</div>}
        {articleError && <div>Artículo: {articleError.message}</div>}
        {imageError && <div>Imagen: {imageError.message}</div>}
      </AlertDescription>
    </Alert>
  );
}

export default ErrorAlert;