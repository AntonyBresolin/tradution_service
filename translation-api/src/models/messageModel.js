import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, unique: false, required: true, },
  text_translated: { type: String, unique: false, required: false, },
  satus: { type: String, enum: ["queued", "processing", "completed", "failed"], default: "queued", required: true, },
}, {
  versionKey: false,
  timestamps: true,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
