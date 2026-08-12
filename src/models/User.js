import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'specialist'], default: 'user' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
