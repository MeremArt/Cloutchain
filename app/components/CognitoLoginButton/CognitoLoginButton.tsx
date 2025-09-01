import { useState } from "react";
import { motion } from "framer-motion";

export default function CognitoLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;
    const responseType = "code";
    const scope = "openid profile email";

    // Debug info (remove in production)
    const debug = {
      domain,
      clientId,
      redirectUri,
      hasAllVars: !!(domain && clientId && redirectUri),
    };
    setDebugInfo(debug);
    console.log("Cognito Debug Info:", debug);

    // Add small delay for better UX
    setTimeout(() => {
      // Validate environment variables
      if (!domain || !clientId || !redirectUri) {
        console.error("Missing Cognito configuration");
        alert("Missing configuration. Check console for details.");
        setIsLoading(false);
        return;
      }

      // Use the working Cognito Hosted UI login endpoint
      const hostedUI = `${domain}/login?client_id=${clientId}&response_type=${responseType}&scope=${encodeURIComponent(
        scope
      )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

      console.log("Redirecting to:", hostedUI);
      window.location.href = hostedUI;
    }, 300);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleLogin}
      className="w-full bg-white text-gray-700 p-4 mt-4 rounded-lg border border-gray-300 shadow-sm transition-all font-medium font-montserrat hover:bg-gray-50 hover:shadow-md flex items-center justify-center gap-3"
      type="button"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Connecting...</span>
        </div>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </motion.button>
  );
}
