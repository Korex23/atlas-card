import AtlasCard from "@/components/general/AtlasCard";
import CtaLine from "@/components/general/CtaCard";
import BalanceSection from "@/components/general/BalanceSection";
import RecentTransactions from "@/components/general/RecentTransactions";
import CardCarousel from "@/components/general/Carousel";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
        <div className="flex lg:flex-row flex-col gap-10">
          <div className="lg:w-[70vw] w-full">
            <BalanceSection />
            {/* <AtlasCard
              address="0x1234567890123456789012345678901234567890"
              domain="example.com"
            /> */}
            <CardCarousel />

            <CtaLine />
          </div>
          <div className="lg:w-[80%]">
            <RecentTransactions />
          </div>
        </div>
      </main>
    </>
  );
}
