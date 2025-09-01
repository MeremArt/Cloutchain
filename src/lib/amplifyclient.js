"use client";

import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";

Amplify.configure({
  ...awsExports,
  ssr: false, // Important for Next.js
});

export default Amplify;
