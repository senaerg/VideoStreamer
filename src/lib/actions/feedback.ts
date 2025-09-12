"use server";

import FeedbackModel from "@/models/FeedbackModel";
import { connectToDatabase } from "../db";

export const sendFeedback = async (args: {
  rating: number;
  comment: string;
  user: string;
}) => {
  try {
  await connectToDatabase();
    await FeedbackModel.create(args);
    return { data: args, message: "Feedback sent" };
  } catch (error: any) {
    return { message: "Sorry an error occurred trying to process request" };
  }
};
