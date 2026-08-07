import mongoose from 'mongoose';

const LegalContentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.LegalContent || mongoose.model('LegalContent', LegalContentSchema);
