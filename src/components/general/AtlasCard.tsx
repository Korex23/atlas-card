import React from "react";
import { Space_Grotesk } from "next/font/google";
import { Copy } from "lucide-react";
import Image from "next/image";
import atlas from "@/assets/atlas.webp";
import logo from "@/assets/logo.png";
import topglow from "@/assets/top-glow.png";
import bottomglow from "@/assets/bottom-glow.png";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface CardProps {
  address: string;
  domain: string;
}

const AtlasCard = ({ address, domain }: CardProps) => {
  return (
    <div className="mx-auto w-[330px] min-[400px]:w-[350px] sm:w-[350px] md:w-[450px] rounded-lg p-[0.5px] bg-linear-to-br from-[#5734F2]/40 via-20% via-white/40 via-60% to-[#FEB601]/40 relative mt-5 hover:scale-[1.02] transition-transform">
      <div className="w-full h-[250px] rounded-lg px-6 py-4 bg-black relative overflow-hidden">
        <div className="absolute z-30 top-0 left-1/2 -translate-x-1/2 w-full">
          <Image src={topglow} alt="Top Glow" width={700} height={500} />
        </div>

        <div className="absolute z-30 bottom-0 right-0">
          <Image
            src={bottomglow}
            alt="Bottom Glow"
            width={460}
            height={120}
            className="opacity-90"
          />
        </div>

        <div className="absolute left-10 top-2 z-5 opacity-80">
          <Image
            src={atlas}
            alt="Atlas Card"
            width={200}
            height={120}
            className="rotate-12"
          />
        </div>

        <div className="z-1">
          <Image
            src={logo}
            alt="Atlas Logo"
            width={50}
            height={30}
            className=""
          />
        </div>

        <div className="flex justify-between h-full items-end pb-10 text-white z-40">
          <div className="z-20">
            <span
              className={`${spaceGrotesk.className} tracking-widest text-sm sm:text-md md:text-xl lg:text-2xl`}
            >
              {address.slice(0, 6)}...{address.slice(-6)}
            </span>
            <Copy className="inline-block ml-2 w-3 h-3 cursor-pointer hover:opacity-70" />
          </div>
          <div className="z-20">
            <span
              className={`${spaceGrotesk.className} uppercase text-xs sm:text-sm md:text-base`}
            >
              {domain}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasCard;
