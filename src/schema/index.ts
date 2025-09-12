import z from "zod"

export const AccountSchema = z.object({
    email: z.string({
      required_error: "Email is required",
    }).email({
      message: "Invalid email address",
    }),
    name: z.string().min(1,{message: "Name must be at least 1 character"}).max(50, { message: "Name must be at most 50 characters"}),
    password: z.string({ required_error: "Password is required" })
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const UpdateVideoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  description: z.string().min(1, "Description is required").max(2500, "Description is too long"),
  tags: z.array(z.string({message: "Tag must be a string"}).max(150, "Too many tags")).default([]), // Optional tags
  categories: z.array(z.string({message: "Category must be a string"})).max(3, "Too many tags").default([]), // Optional tags

});

export const CommentSchema = z.object({
  user: z.string({ required_error: "User ID is required" }).min(1, "User ID cannot be empty"),
  video: z.string({ required_error: "Video ID is required" }).min(1, "Video ID cannot be empty"),
  content: z
    .string({ required_error: "Content is required" })
    .min(3, "Commment must be at least 3 characters")
    .max(1000, "Content must be less than 1000 characters"),
});
