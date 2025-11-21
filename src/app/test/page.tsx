"use client";

import { Suspense } from "react";
import CreateCard from "./card";
import RecoverDelegationForm from "@/components/general/RedeemDelegation";

export default function Home() {
  return (
    <Suspense fallback={<> Loading....</>}>
      <RecoverDelegationForm />
    </Suspense>
  );
}
