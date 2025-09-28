import { useEffect, useRef, useState, Children } from "react";

export default function Carousel({ children }) {
    const scrollerRef = useRef(null);
    const [can, setCan] = useState({ left: false, right: false });

    const updateArrows = () => {
        const el = scrollerRef.current;
        if (!el) return;
        setCan({
            left: el.scrollLeft > 0,
            right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        });
    };

    const scrollByAmount = (dir = 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = Math.round(el.clientWidth * 0.9);
        el.scrollBy({ left: dir * amount, behavior: "smooth" });
    };

    useEffect(() => {
        const el = scrollerRef.current;
        updateArrows();
        if (!el) return;
        el.addEventListener("scroll", updateArrows, { passive: true });
        const ro = new ResizeObserver(updateArrows);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            ro.disconnect();
        };
    }, []);

    return (
        <div className="relative">
            <button
                type="button"
                aria-label="Précédent"
                onClick={() => scrollByAmount(-1)}
                disabled={!can.left}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 shadow hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-40"
            >
                ‹
            </button>

            {/* scroller */}
            <div
                ref={scrollerRef}
                className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {/* piste horizontale */}
                <div className="grid grid-flow-col auto-cols-[15rem] gap-4 snap-x snap-mandatory px-12">
                    {Children.map(children, (child, i) => (
                        <div key={i} className="snap-start">{child}</div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                aria-label="Suivant"
                onClick={() => scrollByAmount(1)}
                disabled={!can.right}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 shadow hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-40"
            >
                ›
            </button>
        </div>
    );
}
