import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, required: true },
  text: { type: String, required: true },
  text_translated: { type: String, required: false },
  sourceLanguage: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  status: { type: String, enum: ["queued", "processing", "completed", "failed"], default: "queued", required: true },
  errorMessage: { type: String, required: false }
}, {
  versionKey: false,
  timestamps: true,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
