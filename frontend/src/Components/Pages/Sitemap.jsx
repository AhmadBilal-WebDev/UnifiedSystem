import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Sitemap = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    {
      name: "Pizza",
      desc: "Cheesy, hand-tossed crusts with premium toppings.",
    },
    {
      name: "Burger",
      desc: "Juicy patties with fresh veggies and secret sauces.",
    },
    {
      name: "Sandwich",
      desc: "Toasted perfection for a light yet filling meal.",
    },
    {
      name: "Roll",
      desc: "Classic paratha and tortilla wraps with a spicy kick.",
    },
    {
      name: "Local Treat",
      desc: "The authentic taste of our traditional heritage.",
    },
    {
      name: "Pasta",
      desc: "Creamy, saucy, and loaded with Italian flavors.",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-gray-800">
        <header className="border-b-4 border-[#d44a1c] pb-6 mb-12">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
            Site <span className="text-[#d44a1c]">Navigation</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl italic">
            Explore the world of Delight Crust. Everything from our delicious
            menu to our privacy protocols is listed below for your overview.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <section className="group">
            <div className="flex items-center mb-6">
              <div className="h-1 w-12 bg-[#d44a1c] mr-3 group-hover:w-20 transition-all duration-500"></div>
              <h2 className="text-2xl font-bold uppercase tracking-widest">
                Main Experience
              </h2>
            </div>
            <ul className="space-y-4">
              {[
                {
                  title: "Digital Storefront",
                  note: "Our main landing page with featured deals.",
                },
                {
                  title: "Explore Full Menu",
                  note: "Browse our entire collection (Menu Section).",
                },
                {
                  title: "Special Deals",
                  note: "Enjoy special Deals.",
                },
                { title: "Add Card", note: "See the cards." },
                {
                  title: "Login to Account",
                  note: "Access your profile and past orders.",
                },
                {
                  title: "Create New Account",
                  note: "Join Delight Crust for exclusive offers.",
                },
              ].map((item, idx) => (
                <li key={idx} className="transition-all duration-300">
                  <span className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </span>
                  <p className="text-sm text-gray-500">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="group">
            <div className="flex items-center mb-6">
              <div className="h-1 w-12 bg-[#d44a1c] mr-3 group-hover:w-20 transition-all duration-500"></div>
              <h2 className="text-2xl font-bold uppercase tracking-widest">
                Taste Categories
              </h2>
            </div>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="block p-3 rounded-lg border border-gray-100 bg-gray-50/50 transition-all duration-300"
                >
                  <span className="text-lg font-semibold block text-gray-900">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-500">{cat.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="group">
            <div className="flex items-center mb-6">
              <div className="h-1 w-12 bg-[#d44a1c] mr-3 group-hover:w-20 transition-all duration-500"></div>
              <h2 className="text-2xl font-bold uppercase tracking-widest">
                Company Info
              </h2>
            </div>
            <ul className="space-y-5">
              {[
                {
                  name: "Privacy Protocol",
                  detail: "How we protect your sensitive data and orders.",
                },
                {
                  name: "Terms and Condition",
                  detail: "The rules and guidelines for using our platform.",
                },
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="border-l-2 border-gray-100 pl-4 transition-colors"
                >
                  <span className="font-semibold text-gray-800">
                    {item.name}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="flex justify-center pt-12 ">
          <button
            title="Go Home"
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer font-bold hover:underline transition-all py-3 px-8   rounded-full text-[#d44a1c] hover:text-[#d44a1c]"
          >
            ← Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
