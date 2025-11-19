"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { X, Mail, Loader2 } from "lucide-react";

export default function AuthModal() {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

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
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setError("");
    setEmail("");
  };

  if (session) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Sign In
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              {!isSuccess ? (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-gray-600">
                      Sign in with your email or Google account
                    </p>
                  </div>

                  {/* Google Sign-In */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 px-4 mb-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {/* <Google size={20} /> */}
                    {isLoading ? "Signing in..." : "Sign in with Google"}
                  </button>

                  <div className="relative flex items-center my-4">
                    <hr className="flex-grow border-gray-300" />
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  {/* Email Sign-In */}
                  <form className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEmailSubmit(e);
                        }}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleEmailSubmit}
                      disabled={isLoading || !email}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Sending...
                        </>
                      ) : (
                        "Send Sign-In Link"
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-500">
                    We'll send you a magic link to sign in without a password
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
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

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h3>

                  <p className="text-gray-600 mb-6">
                    We've sent a magic link to your inbox.
                  </p>

                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
