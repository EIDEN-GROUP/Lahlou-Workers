export function ArcGallery({ images, className, href = "/realisations" }: { images: string[]; className?: string; href?: string }) {
  const doubled = [...images, ...images];

  return (
    <div className={`group overflow-hidden ${className ?? ""}`} style={{ perspective: "1400px" }}>
      <div className="photo-drift flex w-max items-center gap-4 group-hover:[animation-play-state:paused]">
        {doubled.map((src, i) => {
          const offset = i % images.length;
          const lift = Math.abs(offset - (images.length - 1) / 2) * 10;
          const rotate = offset % 2 === 0 ? -9 : 9;
          return (
            <a
              key={i}
              href={href}
              className="block shrink-0 overflow-hidden shadow-2xl transition-opacity duration-300 hover:opacity-80"
              style={{ transform: `translateY(${lift}px) rotateY(${rotate}deg)`, transformStyle: "preserve-3d" }}
              aria-label="Voir nos réalisations"
            >
              <img
                src={src}
                alt="Chantier Lahlou Workers"
                loading="lazy"
                width={480}
                height={640}
                className="h-[300px] w-[200px] object-cover sm:h-[380px] sm:w-[240px]"
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
