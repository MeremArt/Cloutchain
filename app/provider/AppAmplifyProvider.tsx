// app/providers/AppAmplifyProvider.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { Amplify } from "aws-amplify";
import awsExports from "../../src/aws-exports";

export default function AppAmplifyProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Ensure Amplify is configured only in the client
    Amplify.configure({ ...awsExports, ssr: false });
  }, []);

  return <>{children}</>;
}
