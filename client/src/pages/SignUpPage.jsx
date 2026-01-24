import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

import { Fade } from "react-awesome-reveal";

const SignUpPage = ({
  heading = "Sign Up",
  buttonText = "Sign Up",
  loginText = "Already have an account?",
  loginUrl = "/login",
  redirectUrl = "/login",
}) => {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  // -------------------
  //      📦 State
  // -------------------
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = formData;

    const result = await register(userData);

    if (!result.success) {
      return;
    }

    // Navigate to redirect URL (typically login page)
    navigate(redirectUrl);
  };

  // -------------------
  //     🖥️ Render
  // -------------------
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
            {/* SignUp Form */}
            <form
              onSubmit={handleSubmit}
              className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
            >
              {heading && <h1 className="text-xl font-semibold">{heading}</h1>}

              <Input
                type="text"
                placeholder="Username"
                className="text-sm"
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />

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

              <Input
                type="password"
                placeholder="Confirm Password"
                className="text-sm"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                {loading ? "Loading..." : buttonText}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-muted-foreground flex justify-center gap-1 text-sm">
              <p>{loginText}</p>
              <Link
                to={loginUrl}
                className="text-primary font-medium hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Fade>
  );
};

export default SignUpPage;
