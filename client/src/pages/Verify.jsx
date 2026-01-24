import React, { useEffect } from "react";
import { useVerify } from "@/hooks/useVerify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Verify() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const { loading, error, success, verifyEmail } = useVerify();
  const navigate = useNavigate();

  useEffect(() => {
    let token = null;

    //1. Intento leer token desde query params normales (BrowserRouter)
    const searchParams = new URLSearchParams(window.location.search);
    token = searchParams.get("token");

    //2. Si no hay token, intento leer desde el hash (HashRouter)
    if (!token) {
      const hash = window.location.hash; // ej: "#/verify?token=XYZ"
      const queryString = hash.includes("?")
        ? hash.slice(hash.indexOf("?"))
        : "";
      const hashParams = new URLSearchParams(queryString);
      token = hashParams.get("token");
    }

    console.log("Token detected:", token);

    if (token) {
      verifyEmail(token);
    }
  }, [verifyEmail]);

  // -------------------
  //     🖥️ Render
  // -------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md text-center p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {loading ? "Verifying your email..." : "Email Verification"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Please wait while we verify your email.
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center space-y-2">
              <XCircle className="w-10 h-10 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <p className="text-green-600 font-medium">
                Your email has been successfully verified!
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant="default" asChild disabled={loading}>
            <Link to="/login">{success ? "Go to Login" : "Back to Home"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Verify;
