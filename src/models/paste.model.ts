import mongoose, { Schema, Document } from "mongoose";

export interface IPaste extends Document {
  content: string;
  createdAt: number;
  ttlSeconds?: number;
  maxViews?: number;
  viewCount: number;
}

const PasteSchema = new Schema<IPaste>({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  ttlSeconds: {
    type: Number,
    required: false,
  },
  maxViews: {
    type: Number,
    required: false,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<IPaste>("Paste", PasteSchema);
