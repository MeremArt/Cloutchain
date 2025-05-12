import React from "react";
import { CivicAuthProvider } from "@civic/auth-web3/react";

const AppCivicAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const CIVIC_CLIENT_ID = process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "";
  return (
    <CivicAuthProvider clientId={CIVIC_CLIENT_ID}>{children}</CivicAuthProvider>
  );
};

export default AppCivicAuthProvider;
