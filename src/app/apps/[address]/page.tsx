"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
  User,
  FileText,
  Link,
} from "lucide-react";

interface Business {
  _id: string;
  name: string;
  wallet: string;
  description: string;
  logo: string;
  banner: string;
  createdAt: string;
  updatedAt: string;
}

const BusinessProfile = () => {
  const params = useParams();
  const wallet = params.address as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!wallet) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/business/${wallet}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch business information");
        }

        setBusiness(data.business);
      } catch (err: any) {
        setError(err.message || "Failed to load business information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [wallet]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openInExplorer = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, "_blank");
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const authUrl = `${origin}/apps/add-app/${business?.wallet}`;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-neutral-900 text-white border-neutral-800 shadow-2xl">
          <CardHeader className="border-b border-neutral-800 pb-6">
            <Skeleton className="h-8 w-64 bg-neutral-800" />
            <Skeleton className="h-4 w-48 bg-neutral-800 mt-2" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <Skeleton className="h-64 w-full bg-neutral-800" />
              <Skeleton className="h-32 w-full bg-neutral-800" />
              <Skeleton className="h-24 w-full bg-neutral-800" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-neutral-900 text-white border-neutral-800 shadow-2xl">
          <CardContent className="pt-6">
            <Alert className="bg-red-950/50 border-red-700">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-400 ml-2">
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No Business Found
  if (!business) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-neutral-900 text-white border-neutral-800 shadow-2xl">
          <CardContent className="pt-6">
            <Alert className="bg-neutral-800 border-neutral-700">
              <AlertCircle className="h-5 w-5 text-neutral-400" />
              <AlertDescription className="text-neutral-400 ml-2">
                No business found for this wallet address
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-neutral-900/40 backdrop-blur-xl text-white border border-neutral-800/40 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden bg-black">
          {business.banner && (
            <img
              src={business.banner}
              alt={`${business.name} banner`}
              className="w-full h-full object-cover opacity-90"
            />
          )}

          {/* Dark fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Profile Logo & Header */}
        <div className="relative px-8 -mt-20">
          <div className="flex items-end gap-6">
            {/* Logo */}
            <div className="w-32 h-32 rounded-2xl border border-neutral-800/60 overflow-hidden bg-black shadow-[0_0_30px_rgba(0,0,0,0.6)]">
              <img
                src={business.logo}
                alt={`${business.name} logo`}
                className="w-full h-full object-contain p-3"
              />
            </div>

            {/* Name + Badge */}
            <div className="pb-5 flex-1">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-wide">
                  {business.name}
                </h1>

                <Badge className="bg-emerald-600/30 text-emerald-300 border-none rounded-full px-4 py-1 text-xs tracking-wide">
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="pt-8 space-y-8">
          {/* Wallet Section */}
          <div className="bg-black/60 border border-neutral-800/40 rounded-xl p-5 backdrop-blur-md shadow-[0_0_25px_-8px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-neutral-500" />
                <div>
                  <p className="text-xs text-neutral-500 mb-1">
                    Wallet Address
                  </p>
                  <p className="font-mono text-sm text-amber-400">
                    {business.wallet}
                  </p>
                </div>
              </div>

              <button
                onClick={() => openInExplorer(business.wallet)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-700/40 rounded-xl transition-all text-sm"
              >
                <span className="hidden sm:inline">View on Explorer</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-black/60 border border-neutral-800/40 rounded-xl p-6 backdrop-blur-md shadow-[0_0_25px_-8px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-neutral-500" />
              <h3 className="text-lg font-semibold tracking-wide">About</h3>
            </div>
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {business.description}
            </p>
          </div>

          {/* Registration info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/60 border border-neutral-800/40 rounded-xl p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-xs">Registered</p>
              </div>
              <p className="text-sm font-medium">
                {formatDate(business.createdAt)}
              </p>
            </div>

            <div className="bg-black/60 border border-neutral-800/40 rounded-xl p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-xs">Last Updated</p>
              </div>
              <p className="text-sm font-medium">
                {formatDate(business.updatedAt)}
              </p>
            </div>
          </div>

          {/* Authorization URL */}
          <div className="bg-black/60 border border-neutral-800/40 rounded-xl p-5 backdrop-blur-md shadow-[0_0_25px_-8px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Link className="w-4 h-4" />
                  <p className="text-xs">Authorization URL</p>
                </div>

                <p className="text-sm font-medium break-all">
                  <a
                    href={authUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    {authUrl}
                  </a>
                </p>
              </div>

              <button
                onClick={() => window.open(authUrl, "_blank")}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-700/40 rounded-xl transition-all text-sm"
              >
                <span className="hidden sm:inline">Open URL</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessProfile;
