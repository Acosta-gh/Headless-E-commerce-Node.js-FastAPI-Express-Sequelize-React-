import React from "react";
import { Spinner } from "@/components/ui/spinner";

import { Fade } from "react-awesome-reveal";

function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center relative bottom-24">
      <Fade cascade triggerOnce duration={500}>
        <Spinner className="size-8" />
      </Fade>
    </div>
  );
}

export default Loading;
