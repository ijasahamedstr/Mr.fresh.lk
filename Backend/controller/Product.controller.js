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

/* ======================================================
   GET SINGLE PRODUCT (VIEW)
====================================================== */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id)
      .populate("category")
      .populate("mainCategory");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

/* ======================================================
   UPDATE PRODUCT
====================================================== */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

/* ======================================================
   DELETE PRODUCT
====================================================== */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};