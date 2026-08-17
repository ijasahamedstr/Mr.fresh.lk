import CategorySection from "../models/Categories.models.js";

/**
 * CREATE (Save full category tree)
 * Only ONE document is kept
 */
export const createCategorySection = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || categories.length === 0) {
      return res.status(400).json({ message: "Categories are required" });
    }

    // ✅ NO DELETE — old data will remain
    const data = await CategorySection.create({ categories });

    res.status(201).json({
      message: "Categories saved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * GET ALL (returns latest tree)
 */
export const getCategorySections = async (req, res) => {
  try {
    const data = await CategorySection.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE
 */
export const getCategorySectionById = async (req, res) => {
  try {
    const data = await CategorySection.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE
 */
export const updateCategorySection = async (req, res) => {
  try {
    const data = await CategorySection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE
 */
export const deleteCategorySection = async (req, res) => {
  try {
    await CategorySection.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
