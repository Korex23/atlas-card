"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AtlasCard from "./AtlasCard";

interface CardData {
  cardName: string;
  smartAccount: string;
  domain?: string;
  timestamp: string;
}

const CardCarousel = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    const loadCards = () => {
      const storedCards = localStorage.getItem("atlasCardss");
      if (storedCards) {
        const parsedCards: CardData[] = JSON.parse(storedCards);
        const cardsWithDomain = parsedCards.map((card) => ({
          ...card,
          domain: card.domain || `${card.cardName}.com`,
        }));
        setCards(cardsWithDomain);
      }
    };

    loadCards();

    const handleStorageChange = () => {
      loadCards();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const nextCard = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevCard = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextCard();
    } else if (isRightSwipe) {
      prevCard();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(0);
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextCard();
    } else if (isRightSwipe) {
      prevCard();
    }
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#FEB600] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">No cards created yet</p>
          <p className="text-white/40 text-sm mt-2">
            Create your first card to get started
          </p>
        </div>
      </div>
    );
  }

  const getVisibleCards = () => {
    const visible = [];
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      const cardIndex = (currentIndex + i) % cards.length;
      visible.push({
        ...cards[cardIndex],
        index: cardIndex,
        position: i,
      });
    }
    return visible;
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full">
        <div
          ref={carouselRef}
          className="relative h-80 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleCards.map((card, stackIndex) => {
              const position = stackIndex;
              const isActive = position === 0;

              return (
                <div
                  key={`${card.smartAccount}-${card.index}`}
                  className={`absolute transition-all duration-500 ease-in-out pointer-events-none ${
                    isActive
                      ? "z-30 scale-100"
                      : position === 1
                      ? "z-20 scale-90 opacity-80"
                      : "z-10 scale-80 opacity-60"
                  }`}
                  style={{
                    left: isActive
                      ? "50%"
                      : position === 1
                      ? "calc(50% + 40px)"
                      : "calc(50% + 70px)",
                    transform: `translateX(-50%) scale(${
                      isActive ? 1 : position === 1 ? 0.9 : 0.8
                    })`,
                    filter: isActive ? "none" : "blur(1px)",
                  }}
                >
                  <div className="relative">
                    <AtlasCard
                      address={card.smartAccount}
                      domain={card.domain || `${card.cardName}.com`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {cards.length > 1 && (
          <div className="flex justify-center gap-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-[#FEB600] scale-125"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardCarousel;
