
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
    fromUser:  Types.ObjectId;  
    toUser:  Types.ObjectId;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  },
  { timestamps: true }
);

export default  mongoose.models?.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
