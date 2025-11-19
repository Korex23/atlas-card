"use client";

import { Suspense } from "react";
import CreateCard from "./card";

export default function Home() {
  return (
    <Suspense fallback={<> Loading....</>}>
      <CreateCard />
    </Suspense>
  );
}
