"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, Image, Loader2, CheckCircle2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const BusinessForm = () => {
  const { address, isConnected } = useAccount();

  const [form, setForm] = useState({
    name: "",
    wallet: "",
    description: "",
    logo: "",
    banner: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Update wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setForm((prev) => ({ ...prev, wallet: address }));
    } else {
      setForm((prev) => ({ ...prev, wallet: "" }));
    }
  }, [address, isConnected]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await convertToBase64(file);
    setForm((prev) => ({ ...prev, [e.target.name]: base64 }));
  };

  const clearImage = (fieldName: string) => {
    setForm((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setSubmitStatus({
        type: "error",
        message: "Please connect your wallet first",
      });
      return;
    }

    // Validate all fields
    if (!form.name || !form.description || !form.logo || !form.banner) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit business information");
      }

      setSubmitStatus({
        type: "success",
        message: "Business registered successfully!",
      });

      // Reset form after successful submission
      setTimeout(() => {
        setForm({
          name: "",
          wallet: address || "",
          description: "",
          logo: "",
          banner: "",
        });
        setSubmitStatus({ type: null, message: "" });
      }, 3000);
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-neutral-900 text-white border-neutral-800 shadow-2xl">
        <CardHeader className="border-b border-neutral-800 pb-6">
          <CardTitle className="text-2xl font-bold">
            Business / App Information
          </CardTitle>
          <p className="text-neutral-400 text-sm mt-2">
            Complete the form below to register your business
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Status Messages */}
            {submitStatus.type && (
              <div
                className={`p-4 rounded-lg border ${
                  submitStatus.type === "success"
                    ? "bg-green-950/50 border-green-700 text-green-400"
                    : "bg-red-950/50 border-red-700 text-red-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {submitStatus.type === "success" && (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              </div>
            )}

            {/* Business Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Business Name *</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter business name"
                className="bg-neutral-950 border-neutral-700 focus:border-yellow-600 focus:ring-yellow-600"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Logo *</Label>
              {!form.logo ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-yellow-600 transition-colors bg-neutral-950">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-8 h-8 text-neutral-500" />
                    <p className="text-sm text-neutral-400">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, GIF (max. 800x400px)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    name="logo"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              ) : (
                <div className="relative w-full h-40 border-2 border-neutral-700 rounded-lg overflow-hidden bg-neutral-950">
                  <img
                    src={form.logo}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => clearImage("logo")}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Banner Image *</Label>
              {!form.banner ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-yellow-600 transition-colors bg-neutral-950">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Image className="w-8 h-8 text-neutral-500" />
                    <p className="text-sm text-neutral-400">
                      Click to upload banner
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG (recommended: 1200x400px)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    name="banner"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              ) : (
                <div className="relative w-full h-48 border-2 border-neutral-700 rounded-lg overflow-hidden bg-neutral-950">
                  <img
                    src={form.banner}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => clearImage("banner")}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Wallet Connection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Wallet Address *</Label>
              <div className="space-y-3">
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
                {isConnected && form.wallet && (
                  <div className="p-3 bg-neutral-950 border border-neutral-700 rounded-lg">
                    <p className="text-xs text-neutral-400 mb-1">
                      Connected Wallet:
                    </p>
                    <p className="font-mono text-sm text-green-400 break-all">
                      {form.wallet}
                    </p>
                  </div>
                )}
                {!isConnected && (
                  <div className="p-3 bg-neutral-950 border border-neutral-700 rounded-lg">
                    <p className="text-sm text-neutral-400 text-center">
                      Please connect your wallet to continue
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description *</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your business/app"
                className="bg-neutral-950 border-neutral-700 focus:border-yellow-600 focus:ring-yellow-600 min-h-[120px] resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isConnected || isSubmitting}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-6 text-base transition-all hover:shadow-lg hover:shadow-yellow-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : isConnected ? (
                "Submit Business Information"
              ) : (
                "Connect Wallet to Submit"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessForm;
