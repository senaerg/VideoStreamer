
import { connectToDatabase } from "@/lib/db";
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.models?.Category || mongoose.model<ICategory>("Category", CategorySchema);

// const categories = [
//     { name: "Education" },
//     { name: "Technology" },
//     { name: "Entertainment" },
//     { name: "Health & Fitness" },
//     { name: "Science" },
//     { name: "Travel" },
//     { name: "Food & Cooking" },
//     { name: "Sports" },
//     { name: "Music" },
//     { name: "Art & Design" },
//     { name: "Business" },
//     { name: "Finance" },
//     { name: "History" },
//     { name: "Nature & Wildlife" },
//     { name: "Gaming" },
//     { name: "Fashion & Beauty" },
//     { name: "DIY & Crafts" },
//     { name: "Parenting" },
//     { name: "Comedy" },
//     { name: "News & Politics" },
//   ];

// (async () => {
//   try {
//     await connectToDatabase()
//     const existingCount = await CategoryModel?.countDocuments();
//     if (existingCount > 0) {
//       console.log("Categories already exist. Skipping creation.");
//       return;
//     }

//     // Insert all categories
//     await CategoryModel.insertMany(categories);

//     console.log("Categories created:")
//   } catch (error) {
//     console.error("Error creating categories:", error);
//   }
// })()

export default CategoryModel;
