import { useState } from "react";
import Banner from "./Banner";
import Categories from "./Categories";
import Productpage from "./Product page";

// Categories component's props type may not be declared/compatible here;
// cast to any to allow passing selectedCategory and setSelectedCategory.
const CategoriesAny: any = Categories;

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  return (
    <>
    <Banner/>
    <CategoriesAny selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
    <Productpage/>
    </>
  );
};

export default Home;
