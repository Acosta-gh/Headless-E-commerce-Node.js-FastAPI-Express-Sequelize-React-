/*
 * ========================================================================================
 * ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
 * ========================================================================================
 */

import { useCallback, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import {
  register as registerService,
  login as loginService,
  forgot as forgotService,
  reset as resetService
} from "@/services/auth.service";

import { resendVerificationEmail as resendEmailService } from "@/services/verify.services";

const TOKEN_KEY = "token";
const RESEND_STORAGE_KEY = "resend_cooldowns";
const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Get token from localStorage
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set token in localStorage
 * @param {string} token
 */
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get user ID from token
 * @returns {string|null} user ID from token
 */
function getUserId() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.id || null;
  } catch (error) {
    console.error("Error decoding token for user ID:", error);
    return null;
  }
}

/**
 * Remove token from localStorage
 */
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if token is expired
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
  if (!token || !token.includes(".")) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}

/**
 * Check if user is admin
 * @param {string} token
 * @returns {boolean}
 */
function isTokenAdmin(token) {
  if (!token || !token.includes(".")) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Extract error message from error object
 * @param {Error} error
 * @param {string} defaultMessage
 * @returns {string}
 */
function getErrorMessage(error, defaultMessage) {
  return error.response?.data?.error || error.message || defaultMessage;
}

/**
 * Get cooldown data from localStorage
 */
function getCooldowns() {
  try {
    const data = localStorage.getItem(RESEND_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Set cooldown data in localStorage
 */
function setCooldown(email, timestamp) {
  try {
    const cooldowns = getCooldowns();
    cooldowns[email] = timestamp;
    localStorage.setItem(RESEND_STORAGE_KEY, JSON.stringify(cooldowns));
  } catch (error) {
    console.error("Failed to save cooldown:", error);
  }
}

/**
 * Get remaining cooldown time in seconds
 */
function getRemainingCooldown(email) {
  const cooldowns = getCooldowns();
  const lastTime = cooldowns[email];

  if (!lastTime) return 0;

  const timePassed = Date.now() - lastTime;
  const remaining = RESEND_COOLDOWN_MS - timePassed;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);

  /**
   * Handle resend verification email with rate limiting
   */
  const handleResendVerification = useCallback(async (email) => {
    // Check cooldown
    const remainingTime = getRemainingCooldown(email);
    if (remainingTime > 0) {
      const mins = Math.floor(remainingTime / 60);
      const secs = remainingTime % 60;
      throw new Error(
        `Please wait ${mins}:${secs
          .toString()
          .padStart(2, "0")} before resending`,
      );
    }

    try {
      console.log("Attempting to resend email to:", email);
      const result = await resendEmailService(email);
      console.log("Resend result:", result);

      // Set cooldown timestamp
      setCooldown(email, Date.now());

      return result;
    } catch (error) {
      console.error("Resend error:", error);

      // Handle backend rate limit error (429)
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 300;
        setCooldown(email, Date.now()); // Synchronize cooldown
        throw new Error(
          `Too many requests. Please wait ${Math.ceil(
            retryAfter / 60,
          )} minutes.`,
        );
      }

      throw error;
    }
  }, []);

  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Result with token or error
   */
  const login = useCallback(
    async (credentials) => {
      setLoading(true);

      try {
        const data = await loginService(credentials);

        if (data.error) {
          const error = data.error || "Login failed. Please try again.";

          if (
            data.error.includes("not verified") ||
            data.error.includes("verify")
          ) {
            // Verify if cooldown is active
            const remainingTime = getRemainingCooldown(credentials.email);

            if (remainingTime > 0) {
              const mins = Math.floor(remainingTime / 60);
              const secs = remainingTime % 60;

              toast.error("Email has not been verified.");
              toast.error(
                `Please wait ${mins}:${secs
                  .toString()
                  .padStart(2, "0")} before resending`,
                {
                  duration: 10000,
                },
              );
            } else {
              toast.error("Email has not been verified.", {
                action: {
                  label: "Resend Email",
                  onClick: async () => {
                    const toastId = "resend-email"; //Unique ID for this toast

                    try {
                      toast.loading("Sending verification email...", {
                        id: toastId,
                      });

                      await handleResendVerification(credentials.email);

                      toast.success(
                        "Verification email sent! Check your inbox.",
                        {
                          id: toastId,
                        },
                      );
                    } catch (error) {
                      // Error
                      const errorMsg =
                        error.message ||
                        "Failed to send email. Please try again.";
                      toast.error(errorMsg, { id: toastId });
                    }
                  },
                },
                duration: 10000,
              });
            }
          } else {
            toast.error(error);
          }

          return { success: false, error };
        }

        if (!data.token) {
          const error = "Login failed: no token returned from server.";
          toast.error(error);
          return { success: false, error };
        }

        setToken(data.token);
        toast.success("Login successful", {
          action: {
            label: "Close Notification",
            onClick: () => {},
          },
          duration: 1500,
        });

        return {
          success: true,
          token: data.token,
          user: data.user,
        };
      } catch (error) {
        console.error("Login error:", error);
        const message = getErrorMessage(
          error,
          "Login failed. Please check your credentials and try again.",
        );
        toast.error(message);

        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [handleResendVerification],
  );

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Result with success status or error
   */
  const register = useCallback(async (userData) => {
    setLoading(true);

    try {
      const data = await registerService(userData);

      if (data.error) {
        toast.error(data.error);
        return { success: false, error: data.error };
      }

      toast.success("Registration successful. Please verify your email.");

      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      const message = getErrorMessage(
        error,
        "Registration failed. Please try again.",
      );
      toast.error(message);

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    removeToken();
    toast.success("Logged out successfully", {
      action: {
        label: "Close Notification",
        onClick: () => {},
      },
    });
  }, []);

  const forgot = useCallback(async (email) => {
    setLoading(true);

    try {
      const data = await forgotService(email);

      if (data.error) {
        toast.error(data.error);
        return { success: false, error: data.error };
      }

      toast.success("If the email exists, a reset link has been sent");

      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      const message = getErrorMessage(
        error,
        "If the email exists, a reset link has been sent",
      );
      toast.error(message);

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(async (credentials) => {
    setLoading(true);

    try {
      const data = await resetService(credentials);

      if (data.error) {
        toast.error(data.error);
        return { success: false, error: data.error };
      }

      toast.success("Your password was updated successfully.");

      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      const message = getErrorMessage(
        error,
        "Something went wrong while trying to reset your password.",
      );
      toast.error(message);

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = useCallback(() => {
    const token = getToken();
    return token && !isTokenExpired(token);
  }, []);

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    const token = getToken();
    return isTokenAdmin(token);
  }, []);

  return {
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin: isAdmin(),
    loading,
    userId: getUserId(),
    token: getToken(),
    forgot,
    reset
  };
}
