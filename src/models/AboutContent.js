import mongoose from 'mongoose';

const AboutContentSchema = new mongoose.Schema({
  hero: {
    image: { type: String, default: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop' },
    title: { type: String, default: 'Oppdag Nepalvibb' },
    titleEn: { type: String },
    subtitle: { type: String, default: 'Vår Historie' },
    subtitleEn: { type: String },
  },
  mission: {
    title: { type: String, default: 'Vi skaper minner for livet' },
    titleEn: { type: String },
    description: { type: String, default: 'Nepalvibb ble grunnlagt med en lidenskap for å dele skjønnheten og mystikken i Himalaya med resten av verden.' },
    descriptionEn: { type: String },
    stats: [
      { number: { type: String, default: '15+' }, label: { type: String, default: 'Års Erfaring' }, labelEn: { type: String } },
      { number: { type: String, default: '5k+' }, label: { type: String, default: 'Fornøyde Gjest' }, labelEn: { type: String } },
      { number: { type: String, default: '100%' }, label: { type: String, default: 'Lokal Guiding' }, labelEn: { type: String } }
    ],
    image: { type: String, default: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop' },
    quote: { type: String, default: '"Vi reiser ikke bare for å se nye steder, men for å se verden med nye øyne."' },
    quoteEn: { type: String },
  },
  valuesTitle: { type: String, default: 'Våre Kjerneverdier' },
  valuesTitleEn: { type: String },
  valuesSubtitle: { type: String, default: 'Grunnpilarene i alt vi gjør, fra planlegging til gjennomføring.' },
  valuesSubtitleEn: { type: String },
  values: [
    {
      title: { type: String, default: 'Lokal Ekspertise' },
      titleEn: { type: String },
      desc: { type: String, default: 'Våre guider er født og oppvokst i Himalaya, og kjenner hver sti og tradisjon.' },
      descEn: { type: String },
      icon: { type: String, default: 'Compass' }
    },
    {
      title: { type: String, default: 'Bærekraft' },
      titleEn: { type: String },
      desc: { type: String, default: 'Vi forplikter oss til å bevare naturen og støtte lokalsamfunnene vi besøker.' },
      descEn: { type: String },
      icon: { type: String, default: 'Globe' }
    }
  ]
}, { timestamps: true });

export default mongoose.models.AboutContent || mongoose.model('AboutContent', AboutContentSchema);
