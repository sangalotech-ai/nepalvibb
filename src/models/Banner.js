import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  titleEn: {
    type: String,
  },
  subtitle: {
    type: String,
  },
  subtitleEn: {
    type: String,
  },
  highlightText: {
    type: String, // The "Kulturelle" part in the middle
  },
  highlightTextEn: {
    type: String,
  },
  badgeText: {
    type: String,
  },
  badgeTextEn: {
    type: String,
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL'],
  },
  buttonText: {
    type: String,
    default: 'TA EN TUR',
  },
  buttonTextEn: {
    type: String,
    default: 'EXPLORE NOW',
  },
  buttonLink: {
    type: String,
    default: '/trips',
  },
  videoLink: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
