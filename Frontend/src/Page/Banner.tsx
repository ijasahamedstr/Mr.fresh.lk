import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";

const Banner: React.FC = () => {
  const images = [
    "https://i.ibb.co/wFrk2Tzw/d6521ba82a450341313776e65c6575b3.png",
    "https://i.ibb.co/3m08SV1w/39235aa742e560297d0c4700b2cd0306.png",
  ];

  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto slide every 4 seconds
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* IMAGE SLIDER TRACK */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          transition: "transform 0.7s ease",
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {images.map((src, i) => (
          <Box
            key={i}
            component="img"
            src={src}
            alt="banner-slide"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              flexShrink: 0,
              borderRadius: 0, // Ensure no radius at all
            }}
          />
        ))}
      </Box>

      {/* SMALL DOT INDICATORS */}
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
        {images.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              width: index === i ? 8 : 6,
              height: index === i ? 8 : 6,
              borderRadius: "50%",
              background: index === i ? "#fff" : "rgba(255,255,255,0.4)",
              border: "1px solid white",
              transition: "0.3s",
              cursor: "pointer",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Banner;
