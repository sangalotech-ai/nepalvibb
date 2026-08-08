import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  content: { type: String, required: true },
  contentEn: { type: String },
  author: { type: String, default: 'Nepalvibb Editor' },
  authorEn: { type: String },
  category: { type: String, default: 'Travel Tips' },
  categoryEn: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
