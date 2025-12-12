// src/components/Product.tsx
import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export type SpecialProduct = {
  id?: string | number;
  title?: string;
  price?: string | number;
  img?: string;
  weight?: string;
};

type ProductProps = {
  productsSpecial?: SpecialProduct[]; // allow injection of real data
  popularProducts?: SpecialProduct[];
  // accept a combined all-products array (data+images)
  allProductsCombined?: SpecialProduct[];
  totalProducts?: number; // optional total count to display (defaults to 20)
  pageSize?: number; // pagination page size for "All Products"
  cardsCount?: number; // number of cards in first row (defaults to 5)
  /**
   * Optional callback when Add to Bag is clicked.
   * You can pass a function from parent to actually add the product to cart.
   */
  onAddToBag?: (product: SpecialProduct) => void;
};

const defaultSpecials: SpecialProduct[] = [
  {
    id: "s1",
    title: "Toilet Tissue",
    price: "$10.00",
    img: "https://yaldafresh.com/uploads/products/5ccc26419bc305694b41ea5a38d84214.jpg",
  },
  {
    id: "s2",
    title: "Hand Sanitizer - 45g",
    price: "$7.00",
    img: "https://yaldafresh.com/uploads/products/f9e64e8c2780cb6ff34450bdbe1c6547.jpg",
  },
  {
    id: "s3",
    title: "Room Freshener - 3 pcs",
    price: "$22.00",
    img: "https://yaldafresh.com/uploads/products/a1721156636c8b50604fe36a58a39839.jpg",
  },
];

const defaultPopular: SpecialProduct[] = [
  {
    id: "p1",
    title: "Edenia Maz...",
    price: "$5.00",
    img: "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https://storage.googleapis.com/takeapp/media/cmh69s2j6000104l4hml17my8.png",
  },
  {
    id: "p2",
    title: "Deluxe Las...",
    price: "$2.80",
    img: "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:2048/plain/https://storage.googleapis.com/takeapp/media/cmh69tlvj000704il7bdo1k01.png",
  },
  {
    id: "p3",
    title: "Semi-Sk Go...",
    price: "$10.00",
    img: "https://yaldafresh.com/uploads/products/054dd9e5425a990faff57a58fc31f740.jpg",
  },
  {
    id: "p4",
    title: "Lingzhi Cof...",
    price: "$17.00",
    img: "https://yaldafresh.com/uploads/products/dbdd66deeeb1b4d36a9fb5cfbc967882.png",
  },
  {
    id: "p5",
    title: "Palermo's ...",
    price: "$14.20",
    img: "https://yaldafresh.com/uploads/products/1f9bcbb9c7b6a4385ac58e2c740b10b6.jpg",
  },
];

const defaultAllProductsCombined: SpecialProduct[] = [
  { id: "a1", title: "AllProd A1", weight: "250 g", price: "$3.00", img: "https://yaldafresh.com/uploads/products/1f9bcbb9c7b6a4385ac58e2c740b10b6.jpg" },
  { id: "a2", title: "AllProd A2", weight: "500 g", price: "$6.50", img: "https://yaldafresh.com/uploads/products/dbdd66deeeb1b4d36a9fb5cfbc967882.png" },
  { id: "a3", title: "AllProd A3", weight: "1 L", price: "$9.00", img: "https://yaldafresh.com/uploads/products/054dd9e5425a990faff57a58fc31f740.jpg" },
  { id: "a4", title: "AllProd A4", weight: "750 g", price: "$7.25", img: "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:2048/plain/https://storage.googleapis.com/takeapp/media/cmh69tlvj000704il7bdo1k01.png" },
  { id: "a5", title: "AllProd A5", weight: "300 g", price: "$4.10", img: "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https://storage.googleapis.com/takeapp/media/cmh69s2j6000104l4hml17my8.png" },
  { id: "a6", title: "AllProd A6", weight: "400 g", price: "$5.20", img: "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:2048/plain/https://storage.googleapis.com/takeapp/media/cmh69tlvj000704il7bdo1k01.png" },
  { id: "a7", title: "AllProd A7", weight: "600 g", price: "$8.40", img: "https://via.placeholder.com/600x400?text=AllProd+A7" },
  { id: "a8", title: "AllProd A8", weight: "200 g", price: "$2.50", img: "https://via.placeholder.com/600x400?text=AllProd+A8" },
  { id: "a9", title: "AllProd A9", weight: "1.2 kg", price: "$12.00", img: "https://via.placeholder.com/600x400?text=AllProd+A9" },
  { id: "a10", title: "AllProd A10", weight: "350 g", price: "$3.80", img: "https://via.placeholder.com/600x400?text=AllProd+A10" },
];

// Helper price formatter
const formatPriceToLKR = (price?: string | number) => {
  if (price == null) return "";
  const p = typeof price === "number" ? price.toFixed(2) : String(price).trim();
  if (!p) return "";
  const up = p.toUpperCase();
  if (up.startsWith("LKR")) return p;
  if (p.startsWith("$")) {
    const num = p.slice(1).trim();
    return `LKR ${num}`;
  }
  if (/^[\d,.]+$/.test(p)) return `LKR ${p}`;
  return p;
};

// Reusable product card ensuring consistent order: Title -> Weight -> Price -> Button
const ProductCard: React.FC<{
  product: SpecialProduct;
  imgHeight?: number;
  actionButtonSx: any;
  isSm: boolean;
  cardFontFamily: string;
  onAddToBag?: (product: SpecialProduct) => void;
}> = ({ product, imgHeight = 140, actionButtonSx, isSm, cardFontFamily, onAddToBag }) => {
  const imageOnError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const t = e.currentTarget;
    if (!t) return;
    t.onerror = null;
    t.src = "https://via.placeholder.com/600x400?text=No+Image";
  };

  // SIMPLE Add handler: only calls parent callback (no DOM mutation)
  const handleAdd = () => {
    try {
      onAddToBag?.(product);
    } catch (err) {
      // swallow errors from parent handler
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 6px 18px rgba(0,0,0,0.06)", overflow: "hidden", minWidth: 0 }}>
      <CardMedia
        component="img"
        image={product.img}
        alt={product.title ? `${product.title} image` : "Product image"}
        loading="lazy"
        decoding="async"
        onError={imageOnError}
        sx={{ height: imgHeight, objectFit: "contain", width: "100%", display: "block", background: "#fff" }}
      />

      <CardContent>
        {/* Product name */}
        <Typography sx={{ fontSize: 15, fontWeight: 600, fontFamily: cardFontFamily }} noWrap>
          {product.title}
        </Typography>

        {/* Weight (if present) */}
        {product.weight && (
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5, fontFamily: cardFontFamily }}>{product.weight}</Typography>
        )}

        {/* Price block */}
        <Box sx={{ mt: 0.75 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "error.main", fontFamily: cardFontFamily }}>{formatPriceToLKR(product.price)}</Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 3, pt: 1 }}>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" sx={actionButtonSx} size={isSm ? "small" : "small"} aria-label={`add ${product.title} to bag`} onClick={handleAdd}>
            Add to Bag
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const Product: React.FC<ProductProps> = React.memo(
  ({
    productsSpecial = defaultSpecials,
    popularProducts = defaultPopular,
    allProductsCombined = defaultAllProductsCombined,
    totalProducts = 20,
    pageSize = 12,
    cardsCount = 5,
    onAddToBag,
  }) => {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.up("sm"));

    // --- FIRST ROW (specials) => exactly `cardsCount` product cards ---
    const firstRowProducts = useMemo<SpecialProduct[]>(() => {
      const fromSpecials = productsSpecial.slice(0, cardsCount);
      if (fromSpecials.length >= cardsCount) return fromSpecials;
      const needed = cardsCount - fromSpecials.length;
      const fill = popularProducts.slice(0, needed);
      return [...fromSpecials, ...fill];
    }, [productsSpecial, popularProducts, cardsCount]);

    // --- POPULAR (distinct, limit 5) ---
    const popularLimit = 5;
    const popularToShow = useMemo<SpecialProduct[]>(() => {
      const used = new Set(firstRowProducts.map((p) => p.id ?? p.title));
      return popularProducts.filter((p) => !used.has(p.id ?? p.title)).slice(0, popularLimit);
    }, [popularProducts, firstRowProducts]);

    // --- ALL PRODUCTS: take from allProductsCombined, exclude those used in specials/populars, pad to totalProducts ---
    const allProducts = useMemo<SpecialProduct[]>(() => {
      const usedKeys = new Set<string | number>();
      firstRowProducts.forEach((p) => {
        if (p.id != null) usedKeys.add(p.id);
        else if (p.title) usedKeys.add(p.title);
      });
      popularToShow.forEach((p) => {
        if (p.id != null) usedKeys.add(p.id);
        else if (p.title) usedKeys.add(p.title);
      });

      const filtered = allProductsCombined.filter((p) => {
        const key = p.id ?? p.title;
        if (!key) return false;
        return !usedKeys.has(key);
      });

      const filled: SpecialProduct[] = [...filtered];

      // if not enough, try adding remaining popular/special items (not used) to expand
      const pool = [...productsSpecial, ...popularProducts];
      for (const p of pool) {
        const key = p.id ?? p.title;
        if (!key) continue;
        if (usedKeys.has(key)) continue;
        if (filled.find((f) => (f.id ?? f.title) === key)) continue;
        filled.push(p);
        if (filled.length >= totalProducts) break;
      }

      // pad placeholders until reach totalProducts
      let placeholderIdx = 1;
      while (filled.length < totalProducts) {
        const idx = placeholderIdx++;
        filled.push({
          id: `placeholder-${idx}`,
          title: `Sample Product ${idx}`,
          price: `LKR ${(100 + idx).toFixed(2)}`,
          img: `https://via.placeholder.com/600x400?text=Product+${idx}`,
        });
      }

      return filled.slice(0, totalProducts);
    }, [allProductsCombined, productsSpecial, popularProducts, firstRowProducts, popularToShow, totalProducts]);

    // Pagination (ALL PRODUCTS)
    const PAGE_SIZE = pageSize;
    const [visibleCount, setVisibleCount] = useState<number>(() => Math.min(PAGE_SIZE, allProducts.length));
    const canLoadMore = visibleCount < allProducts.length;
    const handleLoadMore = useCallback(() => setVisibleCount((v) => Math.min(allProducts.length, v + PAGE_SIZE)), [PAGE_SIZE, allProducts.length]);

    // layout params
    const gapPx = 12;
    const imgHeight = 140;

    // Button style using your requested color (#c2d142) and a small gradient
    const actionButtonSx = {
      borderRadius: 4,
      textTransform: "none",
      background: "linear-gradient(90deg,#c2d142,#9eb027)",
      color: "#0b0b0b",
      "&:hover": { opacity: 0.95 },
      fontFamily: '"Montserrat", sans-serif',
      whiteSpace: "nowrap",
      minWidth: 92,
      paddingLeft: 12,
      paddingRight: 12,
    };

    // common font family for typographies inside cards
    const cardFontFamily = '"Montserrat", sans-serif';

    // --- Slider behavior (common for Today Special and Popular) ---
    const specialRef = useRef<HTMLDivElement | null>(null);
    const popularRef = useRef<HTMLDivElement | null>(null);

    const scrollByOne = (el: HTMLDivElement | null, direction: "next" | "prev") => {
      if (!el) return;
      const child = el.querySelector<HTMLElement>(".card-snap");
      if (!child) {
        el.scrollBy({ left: direction === "next" ? el.clientWidth : -el.clientWidth, behavior: "smooth" });
        return;
      }
      const style = getComputedStyle(child);
      const marginRight = parseFloat(style.marginRight || "0") || 0;
      const width = child.offsetWidth + marginRight;
      el.scrollBy({ left: direction === "next" ? width : -width, behavior: "smooth" });
    };

    return (
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* TODAY SPECIAL (slider) */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, fontFamily: cardFontFamily }}>Today Special Offer</Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton aria-label="Previous special" onClick={() => scrollByOne(specialRef.current, "prev")} size="small" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton aria-label="Next special" onClick={() => scrollByOne(specialRef.current, "next")} size="small" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          ref={specialRef}
          tabIndex={0}
          role="region"
          aria-label="Today special slider"
          sx={{
            display: "flex",
            gap: `${gapPx}px`,
            mb: 4,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            // hide scrollbar across browsers
            scrollbarWidth: "none", // firefox
            msOverflowStyle: "none", // IE 10+
            "&::-webkit-scrollbar": { display: "none", height: 0 }, // webkit
            "& > .card-snap": {
              scrollSnapAlign: "start",
              flex: "0 0 auto",
              // mobile: full width -> exactly 1 card per view
              width: { xs: "100%", sm: "72%", md: `calc((100% - ${gapPx * (cardsCount - 1)}px)/${Math.min(cardsCount, 3)})`, lg: `calc((100% - ${gapPx * (cardsCount - 1)}px)/${cardsCount})` },
              minWidth: { xs: "100%", sm: 260 },
            },
          }}
        >
          {firstRowProducts.map((data, idx) => {
            const uniqueKey = `${data.id ?? `idx-${idx}`}-${idx}`;
            return (
              <Box key={`card-${uniqueKey}`} className="card-snap" sx={{ minWidth: 0 }}>
                <ProductCard product={data} imgHeight={imgHeight} actionButtonSx={actionButtonSx} isSm={isSm} cardFontFamily={cardFontFamily} onAddToBag={onAddToBag} />
              </Box>
            );
          })}
        </Box>

        {/* POPULAR (slider) */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, fontFamily: cardFontFamily }}>Popular Products</Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton aria-label="Previous popular" onClick={() => scrollByOne(popularRef.current, "prev")} size="small" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton aria-label="Next popular" onClick={() => scrollByOne(popularRef.current, "next")} size="small" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          ref={popularRef}
          tabIndex={0}
          role="region"
          aria-label="Popular products slider"
          sx={{
            display: "flex",
            gap: `${gapPx}px`,
            mb: 4,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none", height: 0 },
            "& > .card-snap": {
              scrollSnapAlign: "start",
              flex: "0 0 auto",
              width: { xs: "100%", sm: "72%", md: "33%", lg: "20%" },
              minWidth: { xs: "100%", sm: 240 },
            },
          }}
        >
          {popularToShow.map((item) => (
            <Box key={`popular-${item.id ?? item.title}`} className="card-snap" sx={{ minWidth: 0 }}>
              <ProductCard product={item} imgHeight={imgHeight} actionButtonSx={actionButtonSx} isSm={isSm} cardFontFamily={cardFontFamily} onAddToBag={onAddToBag} />
            </Box>
          ))}
        </Box>

        {/* ALL PRODUCTS (grid, no slider) */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, fontFamily: cardFontFamily }}>All Products</Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(5, 1fr)",
              },
            }}
          >
            {allProducts.slice(0, visibleCount).map((item) => (
              <ProductCard key={`all-${item.id ?? item.title}`} product={item} imgHeight={imgHeight} actionButtonSx={actionButtonSx} isSm={isSm} cardFontFamily={cardFontFamily} onAddToBag={onAddToBag} />
            ))}
          </Box>

          {canLoadMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleLoadMore}
                sx={{
                  ...actionButtonSx,
                  minWidth: 140,
                  px: 3,
                  boxShadow: "none",
                  border: "1px solid rgba(0,0,0,0.06)",
                  "&:hover": { opacity: 0.95 },
                  fontFamily: cardFontFamily,
                }}
              >
                Load more
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

Product.displayName = "Product";
export default Product;
