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
    toast.success("Link copied to clipboard!", {
      duration: 1000,
      action: { label: "OK", onClick: () => {} },
    });
  };
  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="icon"
        className="hover:bg-blog-hover h-9 w-9 rounded-full cursor-pointer"
        onClick={handleCopy}
        aria-label="Copy link"
      >
        <LinkIcon />
      </Button>
    </div>
  );
}

export default ShareButton;
