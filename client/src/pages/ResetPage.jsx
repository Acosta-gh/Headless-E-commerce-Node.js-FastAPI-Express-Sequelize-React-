import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, XCircle, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function ResetPage() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const { reset, loading } = useAuth();
  const navigate = useNavigate();

  // -------------------
  //      📦 State
  // -------------------
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // -------------------
  //      🪝 Effects
  // -------------------
  useEffect(() => {
    let extractedToken = null;

    // 1. Intento leer token desde query params normales (BrowserRouter)
    const searchParams = new URLSearchParams(window.location.search);
    extractedToken = searchParams.get("token");

    // 2. Si no hay token, intento leer desde el hash (HashRouter)
    if (!extractedToken) {
      const hash = window.location.hash; // ej: "#/reset-password?token=XYZ"
      const queryString = hash.includes("?")
        ? hash.slice(hash.indexOf("?"))
        : "";
      const hashParams = new URLSearchParams(queryString);
      extractedToken = hashParams.get("token");
    }

    console.log("Token detected:", extractedToken);
    setToken(extractedToken);

    if (!extractedToken) {
      setError("Invalid or missing reset token");
    }
  }, []);

  // Redirigir al login después del éxito
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  // -------------------
  //      🔧 Handlers
  // -------------------
  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword) {
      const error = validatePassword(newPassword);
      setValidationError(error || "");
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = async () => {
    // Limpiar errores previos
    setValidationError("");
    setError(null);

    console.log("🚀 Submitting reset password...");

    // Validaciones
    if (!password || !confirmPassword) {
      setValidationError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (!token) {
      setValidationError("Invalid or missing reset token");
      return;
    }

    console.log("📦 Calling reset with:", {
      token: token.substring(0, 10) + "...",
      password: "***",
    });

    // Llamar al hook reset de useAuth
    const result = await reset({ token, password });

    console.log("📨 Reset result:", result);

    if (result.success) {
      console.log("✅ Password reset successful");
      setSuccess(true);
      setError(null);
    } else {
      console.log("❌ Password reset failed:", result.error);
      setError(result.error);
      setSuccess(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  // -------------------
  //     🖥️ Render
  // -------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            {success
              ? "Password Reset Successful"
              : loading
                ? "Resetting Password..."
                : "Reset Your Password"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estado de éxito */}
          {success && (
            <div className="flex flex-col items-center space-y-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
              <p className="text-green-600 font-medium text-center">
                Your password has been successfully reset!
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login...
              </p>
            </div>
          )}

          {/* Estado de error del servidor */}
          {error && !success && (
            <div className="flex flex-col items-center space-y-2 py-4">
              <XCircle className="w-10 h-10 text-destructive" />
              <p className="text-destructive font-medium text-center">
                {error}
              </p>
            </div>
          )}

          {/* Formulario */}
          {!success && !error && token && (
            <div className="space-y-4">
              {/* Campo de nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className={
                      validationError && password ? "border-destructive" : ""
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers
                </p>
              </div>

              {/* Campo de confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className={
                      confirmPassword && password !== confirmPassword
                        ? "border-destructive"
                        : ""
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensaje de error de validación */}
              {validationError && (
                <div className="flex items-start space-x-2 p-3 bg-destructive/10 rounded-md">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{validationError}</p>
                </div>
              )}

              {/* Botón de submit */}
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          )}

          {/* Estado cuando no hay token */}
          {!token && !success && (
            <div className="flex flex-col items-center space-y-2 py-4">
              <XCircle className="w-10 h-10 text-destructive" />
              <p className="text-destructive font-medium text-center">
                Invalid or missing reset token
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild disabled={loading}>
            <Link to="/login">{success ? "Go to Login" : "Back to Login"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ResetPage;
