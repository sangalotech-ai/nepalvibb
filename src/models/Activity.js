import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  descriptionEn: { type: String },
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
