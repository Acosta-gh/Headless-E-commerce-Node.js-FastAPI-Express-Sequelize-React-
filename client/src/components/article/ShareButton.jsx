import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link as LinkIcon } from "lucide-react";

function ShareButton({ url }) {
  // ------------------
  //    🖐️ Handlers
  // ------------------
  const handleCopy = () => {
    const link = url || window.location.href;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles!", {
      duration: 1000,
      action: { label: "OK", onClick: () => {} },
    });
  };

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={handleCopy}
        aria-label="Copiar link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default ShareButton;