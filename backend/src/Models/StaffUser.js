import mongoose from "mongoose";
import bcryptjs from "bcryptjs"; const bcrypt = bcryptjs.default ?? bcryptjs;

/**
 * StaffUser covers every admin-side person:
 * superadmin, client_admin, branch_manager, counter, editor, viewer, kitchen
 *
 * accountType:
 *   "superadmin"   — the SaaS owner (no restaurantId / branchId)
 *   "client_admin" — the restaurant owner
 *   "staff"        — anyone below client_admin; belongs to a branch
 */
const staffSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true, select: false },
    avatar:       { type: String, default: "" },      // initials or image URL
    color:        { type: String, default: "#6366f1" },
    phone:        { type: String, default: "" },

    role: {
      type: String,
      enum: ["superadmin","client_admin","branch_manager","counter","editor","viewer","kitchen"],
      default: "viewer",
    },

    accountType: {
      type: String,
      enum: ["superadmin","client_admin","staff"],
      default: "staff",
    },

    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },

    // For staff: the branch(es) they are assigned to
    branchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],

    // For staff created under a branch admin:
    parentBranchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

    // Granular permissions (array of strings like 'orders.view', 'products.edit')
    permissions: { type: [String], default: [] },

    status:    { type: String, enum: ["active","blocked","inactive"], default: "active" },
    lastLogin: { type: Date, default: null },

    // Password reset
    resetToken:       { type: String, default: null },
    resetTokenExpiry: { type: Date,   default: null },
  },
  { timestamps: true, collection: "staff" }
);

// Hash password before save
staffSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

staffSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never return password in JSON
staffSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

const StaffUser = mongoose.model("StaffUser", staffSchema);
export default StaffUser;
