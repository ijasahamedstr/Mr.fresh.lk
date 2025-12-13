import mongoose from "mongoose";

/* ---------------------------------------------
   Recursive Category Node Schema
--------------------------------------------- */
const CategoryNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String },
    children: {
      type: [],
      default: [],
    },
  },
  { _id: false }
);

// 🔁 Proper recursive assignment
CategoryNodeSchema.add({
  children: [CategoryNodeSchema],
});

/* ---------------------------------------------
   Category Section Schema (ONE TREE)
--------------------------------------------- */
const CategorySectionSchema = new mongoose.Schema(
  {
    categories: {
      type: [CategoryNodeSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CategorySection", CategorySectionSchema);
