import mongoose from 'mongoose';

const ContactContentSchema = new mongoose.Schema({
  hero: {
    title: { type: String, default: 'Kontakt Oss' },
    titleEn: { type: String },
    subtitle: { type: String, default: 'La oss snakke' },
    subtitleEn: { type: String },
    description: { type: String, default: 'Våre reiseeksperter er klare til å hjelpe deg med å planlegge ditt neste eventyr i Himalaya.' },
    descriptionEn: { type: String },
  },
  form: {
    title: { type: String, default: 'Send oss en melding' },
    titleEn: { type: String },
    subtitle: { type: String, default: 'Fyll ut skjemaet nedenfor, så kontakter vi deg i løpet av 24 timer.' },
    subtitleEn: { type: String },
  }
}, { timestamps: true });

export default mongoose.models.ContactContent || mongoose.model('ContactContent', ContactContentSchema);
