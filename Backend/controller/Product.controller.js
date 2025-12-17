import ProductModel from "../models/Product.model.js";

/* ---------- CREATE PRODUCT ---------- */
export const createProduct = async (req, res) => {
  try {
    const product = new ProductModel(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product saved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save product",
    });
  }
};

/* ---------- GET PRODUCTS (OPTIONAL) ---------- */
export const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find()
      .populate("category")
      .populate("mainCategory")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
