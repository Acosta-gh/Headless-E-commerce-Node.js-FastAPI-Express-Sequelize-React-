import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

import { Fade } from "react-awesome-reveal";

const LoginPage = ({
  heading = "Login",
  buttonText = "Login",
  signupText = "Need an account?",
  forgotText = "Forgot your credentials?",
  signupUrl = "/signup",
  forgotUrl = "/forgot",
  redirectUrl = "/profile",
}) => {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // -------------------
  //      📦 State
  // -------------------
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // -------------------
  //     🖐️ Handlers
  // -------------------
  /**
   * Handle input change
   * @param {Event} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   * @param {Event} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData);

    if (!result.success) {
      return;
    }

    // Navigate to redirect URL
    navigate(redirectUrl);
  };

  return (
    <Fade cascade triggerOnce duration={500}>
      <section className="bg-muted h-screen">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 md:top-6 md:left-6 gap-2 group "
        >
          <ArrowLeft className="h-4 w-4  " />
          <span>Go Home</span>
        </Button>{" "}
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-6 lg:justify-start">
            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
            >
              {heading && <h1 className="text-xl font-semibold">{heading}</h1>}

              <Input
                type="email"
                placeholder="Email"
                className="text-sm"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

              <Input
                type="password"
                placeholder="Password"
                className="text-sm"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                {loading ? "Loading..." : buttonText}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="text-muted-foreground flex justify-center gap-1 text-sm">
              <p>{signupText}</p>
              <Link
                to={signupUrl}
                className="text-primary font-medium hover:underline"
              >
                Sign Up
              </Link>
            </div>
            <div className="text-muted-foreground flex justify-center gap-1 text-sm">
              <p>{forgotText}</p>
              <Link
                to={forgotUrl}
                className="text-primary font-medium hover:underline"
              >
                Recover Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Fade>
  );
};

export default LoginPage;
