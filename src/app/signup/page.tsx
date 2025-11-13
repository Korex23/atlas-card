import SignUpForm from "@/components/general/SignUpForm";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex lg:flex-row flex-col gap-10">
        <SignUpForm />
      </div>
    </>
  );
}
