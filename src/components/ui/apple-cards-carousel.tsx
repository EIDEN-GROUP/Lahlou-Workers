import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useOutsideClick } from "@/hooks/use-outside-click";

export type CarouselCard = {
  src: string;
  title: string;
  category: string;
  content: ReactNode;
};

const CarouselContext = createContext<{ onCardClose: (index: number) => void; currentIndex: number }>({
  onCardClose: () => {},
  currentIndex: 0,
});

export function Carousel({ items, initialScroll = 0 }: { items: ReactNode[]; initialScroll?: number }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 360, behavior: "smooth" });

  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384;
      const gap = isMobile() ? 4 : 8;
      carouselRef.current.scrollTo({ left: (cardWidth + gap) * (index + 1), behavior: "smooth" });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          ref={carouselRef}
          onScroll={checkScrollability}
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-6 [scrollbar-width:none] lg:py-10"
        >
          <div className="flex flex-row justify-start gap-4 pl-5 lg:pl-8">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.12 * index, ease: "easeOut" } }}
              >
                {item}
              </motion.div>
            ))}
            <div className="w-1 shrink-0 lg:w-4" />
          </div>
        </div>
        <div className="mr-5 mt-4 flex justify-end gap-2 lg:mr-8">
          <button
            className="flex h-10 w-10 items-center justify-center border border-border bg-background disabled:opacity-30"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Précédent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center border border-border bg-background disabled:opacity-30"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Suivant"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export function Card({ card, index }: { card: CarouselCard; index: number }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    document.body.style.overflow = open ? "hidden" : "";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-foreground/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              ref={containerRef}
              className="relative z-[80] mx-auto my-10 h-fit max-w-4xl border border-border bg-background p-6 lg:p-10"
            >
              <button
                className="sticky top-0 right-0 ml-auto flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-background"
                onClick={handleClose}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary">{card.category}</p>
              <p className="mt-3 font-display text-3xl font-bold lg:text-5xl">{card.title}</p>
              <div className="py-8">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen(true)}
        className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden border border-border bg-secondary lg:h-[34rem] lg:w-80"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-foreground/60 via-transparent to-transparent" />
        <div className="relative z-40 p-6 text-left lg:p-8">
          <p className={cn("font-sans text-sm font-semibold uppercase tracking-[0.1em] text-background/80")}>{card.category}</p>
          <p className="mt-2 max-w-xs font-display text-xl font-bold text-background lg:text-2xl">{card.title}</p>
        </div>
        <img src={card.src} alt={card.title} loading="lazy" width={640} height={800} className="absolute inset-0 z-10 h-full w-full object-cover" />
      </motion.button>
    </>
  );
}
