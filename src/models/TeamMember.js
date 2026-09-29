import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  roleEn: { type: String },
  image: { type: String, default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  bio: { type: String },
  bioEn: { type: String },
  order: { type: Number, default: 0 },
  socialLinks: {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String
  }
}, { timestamps: true });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
