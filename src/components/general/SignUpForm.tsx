"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import image from "@/assets/stackedCard.webp";
import { Button } from "../ui/button";
import { Quantico, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const quantico = Quantico({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-quantico",
});

const manrope = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

const SignUpForm = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Failed to send sign-in link. Please try again.");
      } else {
        setIsSuccess(true);
        setEmail("");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  if (session) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
          <p>You are already signed in.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center lg:justify-between items-center">
        <div className="hidden lg:block lg:w-[50vw] bg-[#41403A] ">
          <div className="flex h-screen justify-center items-center p-6">
            <div className="flex flex-col justify-center items-center gap-6">
              <h1
                className={cn(
                  "text-white font-normal text-5xl text-center leading-14",
                  manrope.className
                )}
              >
                Create Infinite Cards. <br /> Make Endless Payments.
              </h1>
              <Image src={image} alt="cards" width={330} height={330} />
            </div>
          </div>
        </div>
        <div className="flex h-screen justify-center lg:w-[50vw] lg:bg-[#171717] items-center p-6">
          <div className="flex flex-col justify-center items-center gap-6 w-full max-w-md">
            {!isSuccess ? (
              <>
                <h1
                  className={cn(
                    "text-white font-normal text-3xl mb-5",
                    quantico.className
                  )}
                >
                  Sign Up/ Login
                </h1>

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="text-black bg-white rounded-full hover:text-black hover:bg-white hover:border-white w-[400px] h-[50px] text-lg disabled:opacity-50"
                >
                  <span className="flex gap-2 items-center">
                    <span>
                      {isGoogleLoading
                        ? "Signing in..."
                        : "Sign In With Google"}
                    </span>
                    {!isLoading && (
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="scale-[1.3]"
                      >
                        <path
                          d="M15.9996 13.0909V19.2872H24.6105C24.2324 21.2799 23.0977 22.9673 21.3959 24.1018L26.5886 28.1309C29.6141 25.3383 31.3596 21.2364 31.3596 16.3637C31.3596 15.2292 31.2578 14.1382 31.0686 13.091L15.9996 13.0909Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M7.03274 19.0455L5.86159 19.942L1.71606 23.1711C4.34878 28.3928 9.74475 32.0002 15.9992 32.0002C20.3191 32.0002 23.9409 30.5747 26.5882 28.1311L21.3955 24.102C19.9701 25.062 18.1519 25.6439 15.9992 25.6439C11.8393 25.6439 8.30483 22.8366 7.03928 19.0548L7.03274 19.0455Z"
                          fill="#34A853"
                        />
                        <path
                          d="M1.71587 8.82913C0.625023 10.9818 -0.000366211 13.4109 -0.000366211 15.9999C-0.000366211 18.589 0.625023 21.0181 1.71587 23.1708C1.71587 23.1852 7.0396 19.0398 7.0396 19.0398C6.7196 18.0799 6.53046 17.0617 6.53046 15.9998C6.53046 14.9378 6.7196 13.9197 7.0396 12.9597L1.71587 8.82913Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M15.9996 6.3709C18.356 6.3709 20.4505 7.18543 22.1232 8.75636L26.705 4.1746C23.9268 1.58555 20.3196 0 15.9996 0C9.74508 0 4.34878 3.59272 1.71606 8.8291L7.03963 12.96C8.30501 9.17816 11.8396 6.3709 15.9996 6.3709Z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                  </span>
                </Button>

                <div className="w-[400px] space-y-4">
                  <div className="relative flex items-center my-4">
                    <hr className="flex-grow border-gray-600" />
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <hr className="flex-grow border-gray-600" />
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-600 bg-[#2a2a2a] text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-800"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full py-3 px-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center h-[50px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Sending...
                        </>
                      ) : (
                        "Send Sign-In Link"
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-gray-400">
                    We'll send you a magic link to sign in without a password
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h3
                  className={cn(
                    "text-2xl font-bold text-white mb-2",
                    quantico.className
                  )}
                >
                  Check Your Email
                </h3>

                <p className="text-gray-400 mb-6">
                  We've sent a magic link to your inbox.
                </p>

                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    setShowEmailInput(false);
                    setError("");
                  }}
                  className="px-6 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-200"
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpForm;
