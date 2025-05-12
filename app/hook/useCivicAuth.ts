/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useCivicAuth.ts
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@civic/auth-web3/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { AuthState } from "../interface/authstate.interface";

const useCivicAuth = () => {
  // Get Civic Auth state
  const userContext = useUser();
  const { user, isLoading: isCivicLoading, signIn, signOut } = userContext;
  const solana = "solana" in userContext ? userContext.solana : null;
  const router = useRouter();

  // Track authentication state
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    isCivicAuth: false,
  });

  // Effect to check and update authentication state
  useEffect(() => {
    const checkAuth = async () => {
      // First check if we're still waiting for Civic Auth
      if (isCivicLoading) {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        return;
      }

      // Get login method from localStorage
      const loginMethod = localStorage.getItem("loginMethod");
      const token = localStorage.getItem("jwt");

      try {
        // Case 1: User is authenticated with Civic Auth
        if (user && solana?.address) {
          // Check if we already have a JWT token for this wallet
          if (!token || loginMethod !== "civic") {
            // We need to register or login this wallet with our backend
            await handleCivicUserBackendAuth();
            return;
          }

          // We already have a token for this wallet, just update state
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            isCivicAuth: true,
            walletAddress: solana.address,
            email: user.email as string | undefined,
            tiktokUsername: getUserStoredData()?.tiktokUsername,
            userId: getUserStoredData()?.id,
          });
        }
        // Case 2: User has JWT token but not Civic Auth (traditional login)
        else if (token && loginMethod === "traditional") {
          // Validate token by fetching user profile
          try {
            const userData = getUserStoredData();

            // If we have token and user data, consider authenticated
            if (userData) {
              setAuthState({
                isLoading: false,
                isAuthenticated: true,
                isCivicAuth: false,
                walletAddress: userData.walletAddress,
                email: userData.email,
                tiktokUsername: userData.tiktokUsername,
                userId: userData.id,
              });
            } else {
              // Invalid stored data, clear it
              clearAuthData();
              setAuthState({
                isLoading: false,
                isAuthenticated: false,
                isCivicAuth: false,
              });
            }
          } catch (error) {
            console.error("Token validation error:", error);
            clearAuthData();
            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              isCivicAuth: false,
            });
          }
        }
        // Case 3: No authentication
        else {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            isCivicAuth: false,
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isCivicAuth: false,
        });
      }
    };

    checkAuth();
  }, [user, solana, isCivicLoading]);

  // Helper to get stored user data
  const getUserStoredData = () => {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  };

  // Helper to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userData");
    localStorage.removeItem("loginMethod");
  };

  // Handle Civic Auth user registration/login with our backend
  const handleCivicUserBackendAuth = async () => {
    try {
      if (!user || !solana?.address) {
        throw new Error("No Civic Auth user available");
      }

      // First check if this wallet is already registered (try login)
      const loginResponse = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        walletAddress: solana.address,
        authMethod: "civic",
      });

      if (loginResponse.status === 200) {
        // Login successful, store token and user data
        localStorage.setItem("jwt", loginResponse.data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify(loginResponse.data.user)
        );
        localStorage.setItem("loginMethod", "civic");

        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          isCivicAuth: true,
          walletAddress: solana.address,
          email: loginResponse.data.user.email,
          tiktokUsername: loginResponse.data.user.tiktokUsername,
          userId: loginResponse.data.user.id,
        });

        toast.success("Successfully logged in with Civic Auth!");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (loginError) {
      // Login failed, try registration instead
      // Login failed, try registration instead
      try {
        // Add a simple email validation function
        function isValidEmail(email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        // Generate a more unique username
        const username =
          (user?.username as string | undefined) ||
          (user?.email
            ? `${(user.email as string).split("@")[0]}_${Date.now()
                .toString()
                .slice(-4)}`
            : "") ||
          `civic_${Date.now()}`;

        // Improve email validation
        const email =
          user?.email || (username ? `${username}@example.com` : null);
        if (!email || !isValidEmail(email)) {
          toast.error("Valid email is required for registration");
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            isCivicAuth: false,
          });
          return;
        }

        const registerResponse = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, {
          email: email,
          tiktokUsername: username,
          walletAddress: solana?.address,
          authMethod: "civic",
          // Note: Check if your backend requires a password field for Civic Auth users
          // If so, you might need to add a generated password or adjust your backend
        });

        if (registerResponse.status === 201) {
          // Registration successful, store token and user data
          localStorage.setItem("jwt", registerResponse.data.token);
          localStorage.setItem(
            "userData",
            JSON.stringify(registerResponse.data.user)
          );
          localStorage.setItem("loginMethod", "civic");

          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            isCivicAuth: true,
            walletAddress: solana?.address,
            email: registerResponse.data.user.email,
            tiktokUsername: registerResponse.data.user.tiktokUsername,
            userId: registerResponse.data.user.id,
          });

          toast.success("Successfully registered with Civic Auth!");
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (registerError: any) {
        console.error("Civic Auth registration error:", registerError);

        // Extract and log the actual error message from the response
        if (registerError.response && registerError.response.data) {
          console.error("Server error details:", registerError.response.data);
          toast.error(
            registerError.response.data.message ||
              "Failed to register with Civic Auth"
          );
        } else {
          toast.error("Failed to register with Civic Auth");
        }

        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isCivicAuth: false,
        });
      }
    }
  };

  // Login with Civic Auth
  const loginWithCivic = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      toast.loading("Connecting wallet...");

      // This triggers the Civic Auth flow
      await signIn();

      // The authentication will be handled in the useEffect
      // when user and solana are populated

      toast.dismiss();
    } catch (error) {
      console.error("Civic Auth sign in error:", error);
      toast.dismiss();
      toast.error("Failed to connect wallet");

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [signIn]);

  // Login with traditional credentials
  const loginWithCredentials = useCallback(
    async (tiktokUsername: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        toast.loading("Logging in...");

        const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
          tiktokUsername,
          password,
          authMethod: "traditional",
        });

        // Store authentication data
        localStorage.setItem("jwt", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("loginMethod", "traditional");

        // Update auth state
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          isCivicAuth: false,
          walletAddress: response.data.user.walletAddress,
          email: response.data.user.email,
          tiktokUsername: response.data.user.tiktokUsername,
          userId: response.data.user.id,
        });

        toast.dismiss();
        toast.success("Login successful!");

        return true;
      } catch (error) {
        console.error("Login error:", error);
        toast.dismiss();
        toast.error(error instanceof Error ? error.message : "Login failed");

        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    },
    []
  );

  // Register with traditional credentials
  const registerWithCredentials = useCallback(
    async (email: string, tiktokUsername: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        toast.loading("Creating your account...");

        const response = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, {
          email,
          tiktokUsername,
          password,
          authMethod: "traditional",
        });

        // Store authentication data
        localStorage.setItem("jwt", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("loginMethod", "traditional");

        // Update auth state
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          isCivicAuth: false,
          walletAddress: response.data.user.walletAddress,
          email: response.data.user.email,
          tiktokUsername: response.data.user.tiktokUsername,
          userId: response.data.user.id,
        });

        toast.dismiss();
        toast.success("Account created successfully!");

        return true;
      } catch (error) {
        console.error("Registration error:", error);
        toast.dismiss();
        toast.error(
          error instanceof Error ? error.message : "Registration failed"
        );

        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    },
    []
  );

  // Connect a wallet to existing account (for non-Civic users)
  const connectWallet = useCallback(async () => {
    try {
      if (!solana?.address) {
        await signIn();
        return false;
      }

      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("You must be logged in to connect a wallet");
        return false;
      }

      setAuthState((prev) => ({ ...prev, isLoading: true }));
      toast.loading("Connecting wallet...");

      const response = await axios.post(
        API_ENDPOINTS.AUTH.CONNECT_WALLET,
        { walletAddress: solana.address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local storage with new token and user data
      localStorage.setItem("jwt", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      localStorage.setItem("loginMethod", "dual"); // Using both methods

      // Update auth state
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        isCivicAuth: true,
        walletAddress: solana.address,
      }));

      toast.dismiss();
      toast.success("Wallet connected successfully!");

      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to connect wallet"
      );

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [solana, signIn]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // If Civic Auth, sign out of Civic
      if (authState.isCivicAuth) {
        await signOut();
      }

      // Clear local storage
      clearAuthData();

      // Reset auth state
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        isCivicAuth: false,
      });

      toast.success("Logged out successfully");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [authState.isCivicAuth, signOut, router]);

  return {
    // Auth state
    isLoading: authState.isLoading || isCivicLoading,
    isAuthenticated: authState.isAuthenticated,
    isCivicAuth: authState.isCivicAuth,
    walletAddress: authState.walletAddress,
    email: authState.email,
    tiktokUsername: authState.tiktokUsername,
    userId: authState.userId,

    // Civic Auth state from hook
    user,
    solana,

    // Auth methods
    loginWithCivic,
    loginWithCredentials,
    registerWithCredentials,
    connectWallet,
    logout,
  };
};

export default useCivicAuth;
