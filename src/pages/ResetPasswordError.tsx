import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";

const ResetPasswordError = () => {
  const [errorMessage, setErrorMessage] = useState("The password reset link is invalid or has expired");
  const [errorCode, setErrorCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse error from hash or query parameters
    const parseError = () => {
      const hash = location.hash;
      const search = location.search;
      
      let params;
      
      if (hash && hash.includes('error=')) {
        params = new URLSearchParams(hash.substring(1));
      } else if (search && search.includes('error=')) {
        params = new URLSearchParams(search);
      } else {
        return;
      }
      
      const error = params.get('error');
      const code = params.get('error_code');
      const description = params.get('error_description');
      
      console.log("Error details:", { error, code, description });
      
      if (code) {
        setErrorCode(code);
      }
      
      if (description) {
        // Replace + with spaces and decode URI components
        const formattedDescription = decodeURIComponent(description.replace(/\+/g, ' '));
        setErrorMessage(formattedDescription);
      }
    };
    
    parseError();
  }, [location]);

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'otp_expired':
        return 'Reset Link Expired';
      case 'access_denied':
        return 'Access Denied';
      default:
        return 'Reset Error';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <Card className="mx-auto max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{getErrorTitle()}</CardTitle>
            <CardDescription>We couldn't reset your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <AlertTitle>{getErrorTitle()}</AlertTitle>
              <AlertDescription className="mt-2">
                {errorMessage}. Please request a new password reset link.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-500 mt-4">
              <p>This can happen if:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>The link has expired (links are valid for 24 hours)</li>
                <li>The link was already used</li>
                <li>The link was modified or is incomplete</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              Back to Login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/auth", { state: { showReset: true } })}
            >
              Request New Reset Link
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPasswordError; 