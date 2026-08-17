import express from "express";
import {
  createCategorySection,
  deleteCategorySection,
  getCategorySectionById,
  getCategorySections,
  updateCategorySection,
} from "../controller/Category.Controller.js";

const Categorysection = express.Router();

Categorysection.post("/", createCategorySection);
Categorysection.get("/", getCategorySections);
Categorysection.get("/:id", getCategorySectionById);
Categorysection.put("/:id", updateCategorySection);
Categorysection.delete("/:id", deleteCategorySection);

export default Categorysection;
