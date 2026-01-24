import { useRef, useState } from "react";
import { toast } from "sonner";
import { toggleSubscribe } from "@/services/newsletter.services";

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
    * Toggle newsletter subscription for the provided email
    @param {string} email - User's email address
  */
  const toggleSubscription = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await toggleSubscribe(email);
      toast.success("Subscribed to newsletter, verify your email to confirm.", {
        action: {
          label: "Close Notification",
          onClick: () => {},
        },
        duration: 3000,
      });
    } catch (error) {
      setError(error.message);
      
      const errorMessage =
      //  error.response?.data?.error || 
      //  error.response?.data?.message ||
      //  error.message ||
        "An error occurred";

      console.log("Subscription error message:", errorMessage);
      toast.error(errorMessage, {
        action: {
          label: "Close Notification",
          onClick: () => {},
        },
        duration: 3000,
      });
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, toggleSubscription };
};
