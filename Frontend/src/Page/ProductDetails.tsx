import React, { useState } from "react";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

/* ================= FONT ================= */
const Montserrat = '"Montserrat", sans-serif';

/* ================= IMAGES ================= */
const IMAGES = [
  "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https://storage.googleapis.com/takeapp/media/cmh6909jm000304jo4upj4vr5.png",
  "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https://storage.googleapis.com/takeapp/media/cmh69sblr000404ilcrjfd056.png",
  "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https://storage.googleapis.com/takeapp/media/cmh69s2j6000104l4hml17my8.png",
  "https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https://storage.googleapis.com/takeapp/media/cmh68v9ik000204juhwb206f0.png",
];

/* ================= VARIANTS ================= */
const VARIANTS = [
  { id: "v1", title: "BEEF WITH BONE (0.5kg)", price: 1000, image: IMAGES[0] },
  { id: "v2", title: "BEEF WITHOUT BONE (0.5kg)", price: 1250, image: IMAGES[1] },
  { id: "v3", title: "BEEF WITH BONE (1kg)", price: 2000, image: IMAGES[2] },
  { id: "v4", title: "BEEF WITHOUT BONE (1kg)", price: 2500, image: IMAGES[3] },
];

/* ================= COMPONENT ================= */
const ProductDetail: React.FC = () => {
  const [variant, setVariant] = useState(VARIANTS[3]);
  const [mainImage, setMainImage] = useState(VARIANTS[3].image);
  const [qty, setQty] = useState(1);

  const handleVariantChange = (id: string) => {
    const v = VARIANTS.find((x) => x.id === id)!;
    setVariant(v);
    setMainImage(v.image);
  };

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        p: 3,
        fontFamily: Montserrat,
        "& *": { fontFamily: Montserrat },
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        {/* ================= LEFT IMAGE ================= */}
        <Box flex={1}>
          <Box
            sx={{
              borderRadius: 3,
              background: "#f5f5f5",
              p: 2,
            }}
          >
            <img
              src={mainImage}
              alt="product"
              width="100%"
              style={{ objectFit: "contain" }}
            />
          </Box>

          <Stack direction="row" spacing={1} mt={2}>
            {IMAGES.map((img, i) => (
              <Box
                key={i}
                onClick={() => setMainImage(img)}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  border:
                    mainImage === img
                      ? "2px solid #111"
                      : "1px solid #ddd",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <img
                  src={img}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "cover" }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* ================= RIGHT CONTENT ================= */}
        <Box flex={1}>
          <Typography fontSize={22} fontWeight={700}>
            BEEF
          </Typography>

          <Typography color="text.secondary" fontSize={14}>
            LKR 1,000.00 – LKR 2,500.00 <em>(estimated)</em>
          </Typography>

          <Box mt={2} fontSize={14} color="text.secondary">
            🔥 Fresh quality beef <br />
            🏠 Same day delivery <br />
            📞 WhatsApp orders available
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* ================= VARIANTS ================= */}
          <RadioGroup
            value={variant.id}
            onChange={(e) => handleVariantChange(e.target.value)}
          >
            {VARIANTS.map((v) => (
              <FormControlLabel
                key={v.id}
                value={v.id}
                control={<Radio />}
                sx={{
                  mb: 1,
                  alignItems: "flex-start",
                }}
                label={
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Box display="flex" gap={1}>
                      <Box
                        component="img"
                        src={v.image}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                      <Box>
                        <Typography fontSize={13} sx={{fontFamily:Montserrat}}>
                          {v.title}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary" sx={{fontFamily:Montserrat}}>
                          {v.title.includes("0.5") ? "0.5kg" : "1kg"}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography fontWeight={600} sx={{fontFamily:Montserrat}}>
                      LKR {v.price.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>

          <Divider sx={{ my: 3 }} />

          {/* ================= QUANTITY ================= */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontSize={14} sx={{fontFamily:Montserrat}}>
              Quantity ({qty} QTY)
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              border="1px solid #ddd"
              borderRadius={2}
            >
              <IconButton
                size="small"
                onClick={() => qty > 1 && setQty(qty - 1)}
              >
                <RemoveIcon />
              </IconButton>

              <Typography px={2}>{qty}</Typography>

              <IconButton size="small" onClick={() => setQty(qty + 1)}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* ================= ADD BUTTON ================= */}
          <Button
            fullWidth
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: 3,
              backgroundColor: "#1f2933",
              color: "#fff",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#111" },
              fontFamily:Montserrat
            }}
          >
            Add LKR {(variant.price * qty).toLocaleString()}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ProductDetail;
