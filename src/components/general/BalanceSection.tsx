"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { CirclePlus, Eye, EyeClosed, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCardCreation } from "@/context/test/CardCreationContext";
import { cn } from "@/lib/utils";

interface BalanceBreakdown {
  token: string;
  balance: number;
  usdValue: number;
}

const BalanceSection = () => {
  const { data: session } = useSession();
  const { getSmartAccountBalance } = useCardCreation();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const balanceDropdownRef = useRef<HTMLDivElement>(null);

  const [showBalance, setShowBalance] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balanceDropdownOpen, setBalanceDropdownOpen] = useState(false);
  const [totalUSD, setTotalUSD] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceBreakdown, setBalanceBreakdown] = useState<BalanceBreakdown[]>(
    []
  );

  const address = session?.cards?.[0]?.address as `0x${string}`;

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const toggleBalanceDropdown = () => {
    setBalanceDropdownOpen((prev) => !prev);
  };

  const handleShowBalance = () => setShowBalance((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        balanceDropdownRef.current &&
        !balanceDropdownRef.current.contains(event.target as Node)
      ) {
        setBalanceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!address) return;

    const fetchBalances = async () => {
      setLoadingBalance(true);

      try {
        const balances = await getSmartAccountBalance(address);

        const cgResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
        );
        const cgData = await cgResponse.json();
        const ethPriceUsd = cgData?.ethereum?.usd;
        if (typeof ethPriceUsd !== "number") {
          throw new Error("Invalid ETH price from API");
        }

        let total = 0;
        const breakdown: BalanceBreakdown[] = [];

        for (const bal of balances) {
          if (!bal.success || !bal.data) continue;

          const { token, balance } = bal.data;
          const numericBal = Number(balance);
          if (isNaN(numericBal)) continue;

          if (token === "ETH") {
            const usdValue = numericBal * ethPriceUsd;
            total += usdValue;
            breakdown.push({
              token: "ETH",
              balance: numericBal,
              usdValue: usdValue,
            });
          } else if (token === "USDC") {
            total += numericBal;
            breakdown.push({
              token: "USDC",
              balance: numericBal,
              usdValue: numericBal,
            });
          }
        }

        setTotalUSD(total);
        setBalanceBreakdown(breakdown);
      } catch (err) {
        console.error("Error fetching balances or price:", err);
        setTotalUSD(null);
        setBalanceBreakdown([]);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalances();
  }, [address]);

  function getEmailColor(email: string | null | undefined) {
    if (!email) return "#2E6194";
    const namePart = email.split("@")[0];
    let hash = 0;
    for (let i = 0; i < namePart.length; i++) {
      hash = namePart.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += value.toString(16).padStart(2, "0");
    }
    return color;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="relative flex gap-3 items-center" ref={dropdownRef}>
          <div
            className="flex items-center cursor-pointer"
            onClick={toggleDropdown}
          >
            <Avatar
              className="flex items-center justify-center text-white font-medium w-10 h-10 text-lg uppercase"
              style={{ backgroundColor: getEmailColor(session?.user?.email) }}
            >
              {session?.user?.email?.split("@")[0].slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="flex flex-col ml-2">
              <span className="font-normal text-sm md:text-base text-[#595959]">
                Gm
              </span>
              <span className="text-white font-semibold text-md md:text-xl capitalize">
                {session?.user?.email?.split("@")[0]}
              </span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50">
              <button
                onClick={() => signOut({ callbackUrl: "/signup" })}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          )}
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
        <div className="relative" ref={balanceDropdownRef}>
          <span className="text-[#B3B3B3] text-sm md:text-base font-light mb-2 block">
            Total Balance
          </span>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-2xl lg:text-4xl text-[#FEB601]",
                loadingBalance && "text-lg"
              )}
            >
              {loadingBalance ? (
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-1 text-slate-600">
                    <div
                      className="w-2 h-2 bg-[#FEB600] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#FEB600] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#FEB600] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              ) : showBalance ? (
                totalUSD !== null ? (
                  `$${totalUSD.toFixed(2)}`
                ) : (
                  "Error"
                )
              ) : (
                "*****"
              )}
            </span>
            <span className="cursor-pointer" onClick={handleShowBalance}>
              {showBalance ? (
                <Eye className="w-6" fill="#FEB601" />
              ) : (
                <EyeClosed className="w-6" color="#FEB601" />
              )}
            </span>
            {!loadingBalance &&
              totalUSD !== null &&
              balanceBreakdown.length > 0 &&
              showBalance && (
                <span
                  className="cursor-pointer"
                  onClick={toggleBalanceDropdown}
                >
                  <ChevronDown
                    className={cn(
                      "w-6 text-[#FEB601] transition-transform",
                      balanceDropdownOpen && "rotate-180"
                    )}
                  />
                </span>
              )}
          </div>

          {balanceDropdownOpen && balanceBreakdown.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#1B1B1B] rounded-lg shadow-lg z-50 p-4">
              <div className="text-sm font-semibold text-white mb-3">
                Balance Breakdown
              </div>
              {balanceBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{item.token}</span>
                    <span className="text-xs text-gray-400">
                      {item.balance.toFixed(item.token === "ETH" ? 6 : 2)}{" "}
                      {item.token}
                    </span>
                  </div>
                  <span className="font-semibold text-white">
                    ${item.usdValue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => router.push("/create-card")}
          variant={"outline"}
          className="bg-transparent border-dotted border-[#FEB601] rounded-2xl text-[#FEB601] focus:outline-none hover:bg-[#FEB601] hover:text-black"
        >
          Create New Card <CirclePlus />
        </Button>
      </div>
    </section>
  );
};

export default BalanceSection;
