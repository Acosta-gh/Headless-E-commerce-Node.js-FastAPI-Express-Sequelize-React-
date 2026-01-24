"use client";

import { AlertCircle } from "lucide-react";

function Error({ message }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background px-6 py-12">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-600" />
        <h1 className="text-2xl font-bold text-foreground">Error</h1>
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default Error;
