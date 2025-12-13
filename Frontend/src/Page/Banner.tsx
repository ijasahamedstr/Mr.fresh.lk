import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";

type SliderItem = {
  image: string;
  link?: string;
  alt?: string;
};

const Banner: React.FC = () => {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalize = (data: any): SliderItem[] => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return { image: item, alt: "" };
        if (item.image) {
          return {
            image: item.image,
            link: item.link || item.url || undefined,
            alt: item.alt || item.title || item.name || "",
          } as SliderItem;
        }
        if (item.sliderimagelink) {
          return {
            image: item.sliderimagelink,
            link: item.sliderlink || item.link || undefined,
            alt: item.slidername || "",
          } as SliderItem;
        }
        if (item.url) return { image: item.url, alt: item.name || "" };
        return null;
      })
      .filter(Boolean) as SliderItem[];
  };

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const resp = await axios.get(`${import.meta.env.VITE_API_HOST}/Slidersection`);
        let normalized = normalize(resp.data);

        // <-- LIFO: put last API item first
        if (normalized.length) normalized = normalized.reverse();

        setSlides(normalized);
        setIndex(0); // ensure we start at the new-first item
      } catch (error) {
        // silent per preference
      }
    };

    fetchSlider();
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, slides]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: 180, md: 320 },
        height: { xs: 180, md: 320 },
        overflow: "hidden",
        position: "relative",
        bgcolor: slides.length ? "transparent" : "#eee",
      }}
    >
      {!slides.length ? (
        <Box sx={{ width: "100%", height: "100%" }} />
      ) : (
        <>
          <Box
            sx={{
              width: `${slides.length * 100}%`,
              height: "100%",
              display: "flex",
              transition: "transform 0.7s ease",
              transform: `translateX(-${index * (100 / slides.length)}%)`,
            }}
          >
            {slides.map((item, i) => (
              <Box
                key={i}
                sx={{
                  width: `${100 / slides.length}%`,
                  height: "100%",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="a"
                  href={item.link || "#"}
                  target={item.link ? "_blank" : undefined}
                  rel={item.link ? "noopener noreferrer" : undefined}
                  sx={{ display: "block", width: "100%", height: "100%" }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.alt || `slide-${i}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e: any) => (e.currentTarget.style.display = "none")}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
            }}
          >
            {slides.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIndex(i)}
                sx={{
                  width: index === i ? 10 : 7,
                  height: index === i ? 10 : 7,
                  borderRadius: "50%",
                  background: index === i ? "#fff" : "rgba(255,255,255,0.4)",
                  border: "1px solid white",
                  transition: "0.2s",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Banner;
