import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    // null branchId = product is available on ALL branches of this restaurant
    branchId:     { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    categoryId:   { type: mongoose.Schema.Types.ObjectId, ref: "Category",   required: true },

    name:         { type: String, required: true },
    description:  { type: String, default: "" },
    price:        { type: Number, required: true },
    cost:         { type: Number, default: 0 },     // for profit margin analytics
    sku:          { type: String, default: "" },
    image:        { type: String, default: "" },    // URL or initials

    tags:         { type: [String], default: [] },  // 'bestseller', 'popular', 'vegan', 'new'...
    allergens:    { type: [String], default: [] },  // 'gluten', 'dairy', 'nuts'...
    calories:     { type: Number, default: 0 },
    prepTime:     { type: Number, default: 0 },     // minutes

    sizes:  [optionSchema],
    addons: [optionSchema],
    extras: [optionSchema],

    active:       { type: Boolean, default: true },
    featured:     { type: Boolean, default: false },
    stock:        { type: String, enum: ["unlimited","limited","out_of_stock"], default: "unlimited" },
    stockQty:     { type: Number, default: 0 },

    // Analytics fields (updated via order hooks)
    sold:         { type: Number, default: 0 },
    rating:       { type: Number, default: 0 },
    ratingCount:  { type: Number, default: 0 },
  },
  { timestamps: true, collection: "products" }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
