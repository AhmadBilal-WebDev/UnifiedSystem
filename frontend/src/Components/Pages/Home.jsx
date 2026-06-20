import React from "react";
import CodeHeroBanner from "../Menu/Hero";
import ExploreTheMenu from "../Menu/ExploreTheMenu";
import FoodSection from "../Menu/FoodSection";

const Home = ({ addToCart }) => {
  return (
    <>
      <CodeHeroBanner />
      <ExploreTheMenu />
      <div className="bg-white py-10">
        <FoodSection catId="all" addToCart={addToCart} />
      </div>
    </>
  );
};

export default Home;
