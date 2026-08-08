import mongoose from 'mongoose';

const TourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String },
  slug: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  destinationEn: { type: String },
  duration: { type: String, required: true },
  durationEn: { type: String },
  difficulty: { type: String, default: 'Moderat' },
  difficultyEn: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  summary: { type: String, required: true },
  summaryEn: { type: String },
  overview: { type: String },
  overviewEn: { type: String },
  category: { type: [String], default: ['Trekking'] },
  categoryEn: [String],
  highlights: [String],
  highlightsEn: [String],
  itinerary: [
    {
      day: Number,
      title: String,
      titleEn: String,
      details: String,
      detailsEn: String,
      image: String,
    }
  ],
  // New Dynamic Trip Details section
  tripDetails: [
    {
      label: String,
      labelEn: String,
      value: String,
      valueEn: String,
      icon: String, // e.g. 'Clock', 'Mountain', 'Users'
    }
  ],
  priceIncludes: [String],
  priceIncludesEn: [String],
  priceExcludes: [String],
  priceExcludesEn: [String],
  gallery: [String],
  usefulInfo: {
    bestTime: String,
    bestTimeEn: String,
    accommodation: String,
    accommodationEn: String,
    meals: String,
    mealsEn: String,
    visaInfo: String,
    visaInfoEn: String,
    packingList: String,
    packingListEn: String,
  },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Tour || mongoose.model('Tour', TourSchema);
