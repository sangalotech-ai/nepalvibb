import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const { default: HomeContent } = await import('../src/models/HomeContent.js');
  const { default: AboutContent } = await import('../src/models/AboutContent.js');
  const { default: ContactContent } = await import('../src/models/ContactContent.js');
  const { default: TeamMember } = await import('../src/models/TeamMember.js');
  const { default: LegalContent } = await import('../src/models/LegalContent.js');
  const { default: PlanTripQuestion } = await import('../src/models/PlanTripQuestion.js');
  const { default: Destination } = await import('../src/models/Destination.js');
  const { default: Activity } = await import('../src/models/Activity.js');
  const { default: Tour } = await import('../src/models/Tour.js');
  const { default: Banner } = await import('../src/models/Banner.js');
  const { default: Blog } = await import('../src/models/Blog.js');

  // 1. AboutContent
  console.log('\n--- Updating AboutContent ---');
  let about = await AboutContent.findOne();
  if (!about) {
    about = new AboutContent({});
  }
  about.hero = {
    image: about.hero?.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop',
    title: about.hero?.title || 'Oppdag Nepalvibb',
    titleEn: 'Discover Nepalvibb',
    subtitle: about.hero?.subtitle || 'Vår Historie',
    subtitleEn: 'Our Story'
  };
  about.mission = {
    title: about.mission?.title || 'Vi skaper minner for livet',
    titleEn: 'We Create Memories for a Lifetime',
    description: about.mission?.description || 'Nepalvibb ble grunnlagt med en lidenskap for å dele skjønnheten og mystikken i Himalaya med resten av verden.',
    descriptionEn: 'Nepalvibb was founded with a passion for sharing the breathtaking beauty and mystique of the Himalayas with travelers from Scandinavia and around the world.',
    quote: about.mission?.quote || '"Vi reiser ikke bare for å se nye steder, men for å se verden med nye øyne."',
    quoteEn: '"We travel not only to see new places, but to experience the world through fresh eyes."',
    stats: [
      { number: '15+', label: 'Års Erfaring', labelEn: 'Years of Experience' },
      { number: '5k+', label: 'Fornøyde Gjester', labelEn: 'Satisfied Guests' },
      { number: '100%', label: 'Lokal Guiding', labelEn: 'Local Guiding' }
    ],
    image: about.mission?.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop'
  };
  about.valuesTitle = about.valuesTitle || 'Våre Kjerneverdier';
  about.valuesTitleEn = 'Our Core Values';
  about.valuesSubtitle = about.valuesSubtitle || 'Grunnpilarene i alt vi gjør, fra planlegging til gjennomføring.';
  about.valuesSubtitleEn = 'The foundation of everything we do, from planning to execution.';
  about.values = [
    {
      title: 'Lokal Ekspertise',
      titleEn: 'Local Expertise',
      desc: 'Våre guider er født og oppvokst i Himalaya, og kjenner hver sti og tradisjon.',
      descEn: 'Our guides were born and raised in the Himalayas, knowing every trail, summit, and local tradition.',
      icon: 'Compass'
    },
    {
      title: 'Bærekraft',
      titleEn: 'Sustainability',
      desc: 'Vi forplikter oss til å bevare naturen og støtte lokalsamfunnene vi besøker.',
      descEn: 'We are committed to preserving fragile alpine nature and empowering the local mountain communities we visit.',
      icon: 'Globe'
    },
    {
      title: 'Sikkerhet Først',
      titleEn: 'Safety First',
      desc: 'Din trygghet er vår høyeste prioritet på alle våre ekspedisjoner og turer.',
      descEn: 'Your safety is our highest priority across all Himalayan expeditions and treks.',
      icon: 'Sparkles'
    }
  ];
  await about.save();
  console.log('AboutContent updated successfully');

  // 2. ContactContent
  console.log('\n--- Updating ContactContent ---');
  let contact = await ContactContent.findOne();
  if (!contact) {
    contact = new ContactContent({});
  }
  contact.hero = {
    title: contact.hero?.title || 'Kontakt Oss',
    titleEn: 'Contact Us',
    subtitle: contact.hero?.subtitle || 'La oss snakke',
    subtitleEn: "Let's Talk",
    description: contact.hero?.description || 'Våre reiseeksperter er klare til å hjelpe deg med å planlegge ditt neste eventyr i Himalaya.',
    descriptionEn: 'Our Himalayan travel experts are ready to help you plan your bespoke adventure in Nepal and beyond.'
  };
  contact.form = {
    title: contact.form?.title || 'Send oss en melding',
    titleEn: 'Send Us a Message',
    subtitle: contact.form?.subtitle || 'Fyll ut skjemaet nedenfor, så kontakter vi deg i løpet av 24 timer.',
    subtitleEn: 'Fill out the form below and our team will get back to you within 24 hours.'
  };
  await contact.save();
  console.log('ContactContent updated successfully');

  // 3. Team Members
  console.log('\n--- Updating Team Members ---');
  const teamMembers = await TeamMember.find();
  const teamTranslations = {
    'Suman': { roleEn: 'Founder & CEO', bioEn: 'Passionate Himalayan explorer with over 15 years of expedition leadership.' },
    'Sajan': { roleEn: 'Operations & Tech Lead', bioEn: 'Ensuring seamless customer experiences and sustainable digital travel systems.' },
    'Pasang': { roleEn: 'Head Mountain Guide', bioEn: 'Certified mountaineer with dozens of successful high-altitude summits.' },
    'Pemba': { roleEn: 'Lead Trekking Specialist', bioEn: 'Deep knowledge of remote Himalayan trails and local cultures.' }
  };
  for (const member of teamMembers) {
    let matched = false;
    for (const [key, t] of Object.entries(teamTranslations)) {
      if (member.name.toLowerCase().includes(key.toLowerCase())) {
        member.roleEn = t.roleEn;
        member.bioEn = t.bioEn;
        matched = true;
        break;
      }
    }
    if (!matched) {
      member.roleEn = member.role;
      member.bioEn = member.bio || '';
    }
    await member.save();
    console.log(`Updated Team Member: ${member.name} (${member.role} -> ${member.roleEn})`);
  }

  // 4. PlanTripQuestions
  console.log('\n--- Updating PlanTripQuestions ---');
  const questions = await PlanTripQuestion.find().sort({ order: 1 });
  const questionMap = {
    0: {
      questionEn: 'Group Size',
      descriptionEn: 'Who will you be traveling with?',
      optionsEn: [
        { value: 'solo', labelEn: 'Solo Traveler', descriptionEn: 'Single traveler' },
        { value: 'couple', labelEn: 'Couple', descriptionEn: 'Two travelers' },
        { value: 'family', labelEn: 'Family', descriptionEn: 'Family with kids/teens' },
        { value: 'group', labelEn: 'Group', descriptionEn: 'Friends or club group' }
      ]
    },
    1: {
      questionEn: 'Travel Dates',
      descriptionEn: 'When are you planning to visit the Himalayas?',
      optionsEn: [
        { value: 'flexible', labelEn: 'Flexible Dates', descriptionEn: 'Open to recommendations' },
        { value: 'fixed', labelEn: 'Specific Dates', descriptionEn: 'Exact travel window' },
        { value: 'spring', labelEn: 'Spring (Mar - May)', descriptionEn: 'Rhododendrons & clear skies' },
        { value: 'autumn', labelEn: 'Autumn (Sep - Nov)', descriptionEn: 'Best mountain visibility' }
      ]
    },
    2: {
      questionEn: 'Tour Details & Accommodation',
      descriptionEn: 'Please specify your preferred travel comfort level.',
      optionsEn: [
        { 
          value: 'comfortable', 
          labelEn: 'Comfortable', 
          descriptionEn: 'Equivalent to 3-star standard. Clean, cozy, and well-located lodges.' 
        },
        { 
          value: 'luxury', 
          labelEn: 'Luxury', 
          descriptionEn: 'Equivalent to 4-star boutique hotels and premium heritage lodges.' 
        },
        { 
          value: 'luxury-plus', 
          labelEn: 'Luxury Plus', 
          descriptionEn: 'Top 5-star mountain luxury resorts and world-class hospitality.' 
        },
        { 
          value: 'camping', 
          labelEn: 'Alpine Camping', 
          descriptionEn: 'Full wilderness camping experience under the Himalayan stars.' 
        }
      ]
    }
  };

  for (const [idx, q] of questions.entries()) {
    const qData = questionMap[idx] || questionMap[q.order];
    if (qData) {
      q.questionEn = qData.questionEn;
      q.descriptionEn = qData.descriptionEn;
      if (Array.isArray(q.options)) {
        q.options = q.options.map(opt => {
          const optMatch = qData.optionsEn.find(o => o.value === opt.value);
          return {
            ...opt.toObject(),
            labelEn: optMatch?.labelEn || opt.label,
            descriptionEn: optMatch?.descriptionEn || opt.description
          };
        });
      }
      await q.save();
      console.log(`Updated Question #${idx}: ${q.question} -> ${q.questionEn}`);
    }
  }

  // 5. Legal Content (Vilkar & Personvern)
  console.log('\n--- Updating Legal Content ---');
  const legalDocs = await LegalContent.find();
  for (const doc of legalDocs) {
    if (doc.slug === 'vilkar' || doc.slug === 'terms') {
      doc.titleEn = 'Terms & Conditions';
      if (!doc.contentEn) {
        doc.contentEn = `<h2>1. Booking and Payments</h2><p>All bookings made through Nepalvibb are subject to confirmation upon deposit receipt.</p><h2>2. Cancellation Policy</h2><p>Cancellations made 30 days prior to departure receive a full refund minus administrative fees.</p><h2>3. Travel Insurance</h2><p>Comprehensive travel and medical evacuation insurance is mandatory for all Himalayan trekking expeditions.</p>`;
      }
      await doc.save();
      console.log('Updated Terms & Conditions');
    } else if (doc.slug === 'personvern' || doc.slug === 'privacy') {
      doc.titleEn = 'Privacy Policy';
      if (!doc.contentEn) {
        doc.contentEn = `<h2>1. Information We Collect</h2><p>We collect essential personal information required to book permits, flights, and accommodations in Nepal.</p><h2>2. Data Protection</h2><p>Your personal data is encrypted and securely processed in compliance with GDPR regulations.</p>`;
      }
      await doc.save();
      console.log('Updated Privacy Policy');
    }
  }

  // 6. HomeContent verification
  console.log('\n--- Verifying HomeContent ---');
  let home = await HomeContent.findOne();
  if (home) {
    if (!home.destinations) home.destinations = {};
    home.destinations.subtitleEn = home.destinations.subtitleEn || 'Discover the world with us';
    home.destinations.titleEn = home.destinations.titleEn || 'Choose Your Next Destination';

    if (!home.activities) home.activities = {};
    home.activities.subtitleEn = home.activities.subtitleEn || 'Things to do in the Himalayas';
    home.activities.titleEn = home.activities.titleEn || 'Adventurous Experiences';

    if (!home.tours) home.tours = {};
    home.tours.subtitleEn = home.tours.subtitleEn || 'Our Most Popular Journeys';
    home.tours.titleEn = home.tours.titleEn || 'Find Your Perfect Himalayan Adventure';

    if (!home.whoWeAre) home.whoWeAre = {};
    home.whoWeAre.subtitleEn = home.whoWeAre.subtitleEn || 'Who We Are';
    home.whoWeAre.titleEn = home.whoWeAre.titleEn || 'Nepalvibb – No one knows Nepal better than us';
    home.whoWeAre.descriptionEn = home.whoWeAre.descriptionEn || 'Welcome to Nepalvibb, a proud subsidiary of Actual Adventure Pvt. Ltd. With over 15 years of dedication, we are the premier travel provider for Scandinavian travelers in Nepal.';
    home.whoWeAre.yearsOfExperienceLabelEn = home.whoWeAre.yearsOfExperienceLabelEn || 'Years Experience';
    home.whoWeAre.feature1TitleEn = home.whoWeAre.feature1TitleEn || 'SAFETY';
    home.whoWeAre.feature1DescEn = home.whoWeAre.feature1DescEn || 'Safety at the forefront of every expedition.';
    home.whoWeAre.feature2TitleEn = home.whoWeAre.feature2TitleEn || 'EXPERTISE';
    home.whoWeAre.feature2DescEn = home.whoWeAre.feature2DescEn || 'Local Sherpa guides with deep terrain knowledge.';

    if (!home.purpose) home.purpose = {};
    home.purpose.subtitleEn = home.purpose.subtitleEn || 'Social Responsibility';
    home.purpose.titleEn = home.purpose.titleEn || 'A Journey with Purpose: Your Adventure – Their Hope';
    home.purpose.descriptionEn = home.purpose.descriptionEn || 'We support local street dog rescue initiatives in Nepal through Actual Adventure Foundation. Every journey you book contributes directly to medical care, sterilization, and shelter.';
    home.purpose.buttonTextEn = home.purpose.buttonTextEn || 'Learn More About the Foundation';

    await home.save();
    console.log('HomeContent verified and saved');
  }

  console.log('\nAll English translations successfully populated in database!');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
