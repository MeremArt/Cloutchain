import SonicGiftPage from "../components/SonicGiftPage/SonicGiftPage";
import { Suspense } from "react";

export default function GiftPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SonicGiftPage />
    </Suspense>
  );
}
