import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { Fade } from "react-awesome-reveal";
import { ArrowLeft } from "lucide-react";

const ForgotPage = ({
  heading = "Reset Password",
  buttonText = "Send Reset Link",
  loginText = "Remember your password?",
  loginUrl = "/login",
  successMessage = "Check your email for the reset link",
}) => {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const { forgot, loading } = useAuth();
  const navigate = useNavigate();

  // -------------------
  //      📦 State
  // -------------------
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  // -------------------
  //     🖐️ Handlers
  // -------------------
  /**
   * Handle input change
   * @param {Event} e
   */
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  /**
   * Handle form submission
   * @param {Event} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgot({ email });

    if (!result.success) {
      return;
    }

    // Show success message
    setSuccess(true);
  };

  return (
    <Fade cascade triggerOnce duration={500}>
      <section className="bg-muted h-screen">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 gap-2 group "
        >
          <ArrowLeft className="h-4 w-4  " />
          <span>Go Back</span>
        </Button>{" "}

        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-6 lg:justify-start">
            {/* Forgot Password Form */}
            <form
              onSubmit={handleSubmit}
              className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
            >
              {heading && <h1 className="text-xl font-semibold">{heading}</h1>}

              {success ? (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    {successMessage}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground text-center text-sm">
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </p>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="text-sm"
                    required
                    name="email"
                    value={email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Spinner className="mr-2" /> : null}
                    {loading ? "Sending..." : buttonText}
                  </Button>
                </>
              )}
            </form>

            {/* Login Link */}
            <div className="text-muted-foreground flex justify-center gap-1 text-sm">
              <p>{loginText}</p>
              <Link
                to={loginUrl}
                className="text-primary font-medium hover:underline"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Fade>
  );
};

export default ForgotPage;
