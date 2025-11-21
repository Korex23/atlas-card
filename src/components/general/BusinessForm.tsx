"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  Image,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "North Korea",
  "South Korea",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const BusinessForm = () => {
  const { address, isConnected } = useAccount();

  const [form, setForm] = useState({
    name: "",
    wallet: "",
    description: "",
    logo: "",
    banner: "",
    callbackUrl: "",
    country: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [authUrl, setAuthUrl] = useState("");
  const [copied, setCopied] = useState(false);

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(authUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    if (
      !form.name ||
      !form.description ||
      !form.logo ||
      !form.banner ||
      !form.callbackUrl ||
      !form.country
    ) {
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

      // Generate auth URL
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const generatedAuthUrl = `${origin}/apps/add-app/${form.wallet}`;
      setAuthUrl(generatedAuthUrl);

      setSubmitStatus({
        type: "success",
        message: "Business registered successfully!",
      });
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      wallet: address || "",
      description: "",
      logo: "",
      banner: "",
      callbackUrl: "",
      country: "",
    });
    setSubmitStatus({ type: null, message: "" });
    setAuthUrl("");
  };

  if (authUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-gradient-to-br from-green-950 to-neutral-900 text-white border-green-700 shadow-2xl">
          <CardHeader className="border-b border-green-800 pb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
              <div>
                <CardTitle className="text-2xl font-bold">
                  Registration Successful!
                </CardTitle>
                <p className="text-green-300 text-sm mt-1">
                  Your business has been registered successfully
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-neutral-950 border border-green-700 rounded-lg p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-green-400">
                  Business Name
                </Label>
                <p className="text-lg font-semibold mt-1">{form.name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-green-400">
                  Country
                </Label>
                <p className="text-lg mt-1">{form.country}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-green-400">
                  Authentication URL
                </Label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                    <p className="font-mono text-sm text-green-400 break-all">
                      {authUrl}
                    </p>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    className="bg-green-600 hover:bg-green-700 shrink-0"
                    size="icon"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Use this URL to integrate authentication with your app
                </p>
              </div>

              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-green-600/20"
              >
                <ExternalLink className="w-4 h-4" />
                Open Authentication Page
              </a>
            </div>

            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full border-neutral-700 hover:bg-neutral-800 text-white"
            >
              Register Another Business
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

            {/* Callback URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Callback URL *</Label>
              <Input
                name="callbackUrl"
                value={form.callbackUrl}
                onChange={handleChange}
                placeholder="https://yourdomain.com/callback"
                type="url"
                className="bg-neutral-950 border-neutral-700 focus:border-yellow-600 focus:ring-yellow-600"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-neutral-400">
                URL where users will be redirected after authentication
              </p>
            </div>

            {/* Country Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Country *</Label>
              <Select
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, country: value }))
                }
                value={form.country}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-neutral-950 border border-neutral-700 text-white focus:border-yellow-600 focus:ring-yellow-600">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>

                <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                  {COUNTRIES.map((country) => (
                    <SelectItem
                      key={country}
                      value={country}
                      className="text-white focus:bg-neutral-800"
                    >
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
