"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { CirclePlus, Eye, EyeClosed, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const BalanceSection = () => {
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const router = useRouter();

  const handleShowBalance = () => {
    setShowBalance((prev) => !prev);
  };
  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-3 items-center">
            <Avatar className="bg-[#2E6194] flex items-center justify-center text-white font-medium w-10 h-10 text-lg">
              KH
            </Avatar>
            <div className="flex flex-col">
              <span className="font-normal text-sm md:text-base text-[#595959]">
                Gm
              </span>
              <span className="text-white font-semibold text-md md:text-xl">
                Kri8tive Haropis
              </span>
            </div>
          </div>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="24" fill="white" />
            <path
              d="M32.7936 28.4944C32.2733 27.5981 31.4999 25.0622 31.4999 21.75C31.4999 19.7609 30.7097 17.8532 29.3032 16.4467C27.8967 15.0402 25.989 14.25 23.9999 14.25C22.0108 14.25 20.1031 15.0402 18.6966 16.4467C17.2901 17.8532 16.4999 19.7609 16.4999 21.75C16.4999 25.0631 15.7255 27.5981 15.2052 28.4944C15.0723 28.7222 15.0019 28.9811 15.001 29.2449C15.0001 29.5086 15.0687 29.768 15.2 29.9967C15.3313 30.2255 15.5207 30.4156 15.7489 30.5478C15.9771 30.6801 16.2361 30.7498 16.4999 30.75H20.3258C20.4989 31.5967 20.959 32.3577 21.6285 32.9042C22.298 33.4507 23.1357 33.7492 23.9999 33.7492C24.8641 33.7492 25.7018 33.4507 26.3713 32.9042C27.0407 32.3577 27.5009 31.5967 27.674 30.75H31.4999C31.7636 30.7496 32.0225 30.6798 32.2506 30.5475C32.4787 30.4151 32.6678 30.225 32.799 29.9963C32.9302 29.7676 32.9988 29.5083 32.9979 29.2446C32.9969 28.9809 32.9265 28.7222 32.7936 28.4944ZM23.9999 32.25C23.5347 32.2499 23.081 32.1055 22.7013 31.8369C22.3215 31.5683 22.0343 31.1886 21.8793 30.75H26.1205C25.9655 31.1886 25.6783 31.5683 25.2985 31.8369C24.9188 32.1055 24.4651 32.2499 23.9999 32.25ZM16.4999 29.25C17.2218 28.0087 17.9999 25.1325 17.9999 21.75C17.9999 20.1587 18.632 18.6326 19.7572 17.5074C20.8825 16.3821 22.4086 15.75 23.9999 15.75C25.5912 15.75 27.1173 16.3821 28.2425 17.5074C29.3678 18.6326 29.9999 20.1587 29.9999 21.75C29.9999 25.1297 30.7761 28.0059 31.4999 29.25H16.4999Z"
              fill="black"
            />
          </svg>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#B3B3B3] text-sm md:text-base font-light mb-2">
              Total Balance
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl lg:text-5xl text-[#FEB601]">
                {showBalance ? "$10.23" : "*****"}
              </span>{" "}
              <span className="cursor-pointer">
                {showBalance ? (
                  <Eye
                    className="w-6"
                    fill="#FEB601"
                    onClick={handleShowBalance}
                  />
                ) : (
                  <EyeClosed
                    className="w-6"
                    color="#FEB601"
                    onClick={handleShowBalance}
                  />
                )}
              </span>
            </div>
          </div>
          <Button
            onClick={() => {
              router.push("/create-card");
            }}
            variant={"outline"}
            className="bg-transparent border-dotted border-[#FEB601] rounded-2xl text-[#FEB601] focus:outline-none hover:bg-[#FEB601] hover:text-black"
          >
            Create New Card
            <CirclePlus />
          </Button>
        </div>
      </section>
    </>
  );
};

export default BalanceSection;
