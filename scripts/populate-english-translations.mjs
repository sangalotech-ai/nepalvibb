import mongoose from 'mongoose';

async function populateTranslations() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log("Connected to MongoDB");

  // 1. BANNERS
  const banners = await db.collection("banners").find({}).toArray();
  for (const b of banners) {
    let update = {};
    if (b.title === "Unike" || b.title?.includes("Unike")) {
      update = {
        titleEn: "Unique",
        highlightTextEn: "Cultural",
        subtitleEn: "Experiences",
        badgeTextEn: "Discover the most exciting places",
        buttonTextEn: "EXPLORE NOW"
      };
    } else if (b.title === "Mektige" || b.title?.includes("Mektige")) {
      update = {
        titleEn: "Mighty",
        highlightTextEn: "Himalayan",
        subtitleEn: "Peaks",
        badgeTextEn: "Adventures of a lifetime",
        buttonTextEn: "VIEW OUR TOURS"
      };
    } else if (b.title === "Autentiske" || b.title?.includes("Autentiske")) {
      update = {
        titleEn: "Authentic",
        highlightTextEn: "Village Life",
        subtitleEn: "Close to Nature",
        badgeTextEn: "Stay with local families",
        buttonTextEn: "EXPLORE MORE"
      };
    } else {
      update = {
        titleEn: b.title,
        highlightTextEn: b.highlightText,
        subtitleEn: b.subtitle,
        badgeTextEn: b.badgeText,
        buttonTextEn: "EXPLORE NOW"
      };
    }
    await db.collection("banners").updateOne({ _id: b._id }, { $set: update });
  }
  console.log("Updated Banners");

  // 2. DESTINATIONS
  const destUpdates = {
    "Nepal": {
      nameEn: "Nepal",
      descriptionEn: "Discover Nepal, home to the Himalayas, ancient cultural heritage, and world-class trekking routes."
    },
    "Bhutan": {
      nameEn: "Bhutan",
      descriptionEn: "The Land of the Thunder Dragon, famed for its pristine landscapes, Buddhist monasteries, and Gross National Happiness."
    },
    "Tibet": {
      nameEn: "Tibet",
      descriptionEn: "The roof of the world, a sacred land of ancient spirituality, high plateaus, and Himalayan panoramas."
    },
    "India": {
      nameEn: "India",
      descriptionEn: "A vibrant realm of rich history, majestic royal palaces, rich heritage, and breathtaking diversity."
    }
  };

  for (const [name, data] of Object.entries(destUpdates)) {
    await db.collection("destinations").updateOne({ name }, { $set: data });
  }
  console.log("Updated Destinations");

  // 3. ACTIVITIES
  const actUpdates = {
    "Trekking": {
      nameEn: "Trekking",
      descriptionEn: "Experience world-famous Himalayan trekking routes with experienced local guides and porters."
    },
    "Jungelsafari": {
      nameEn: "Jungle Safari",
      descriptionEn: "Encounter one-horned rhinos, Bengal tigers, and exotic wildlife in Nepal's lush national parks."
    },
    "Turer": {
      nameEn: "Tours & Sightseeing",
      descriptionEn: "Immerse yourself in UNESCO World Heritage sites, historic temples, and vibrant local cultural traditions."
    },
    "Rafting": {
      nameEn: "White Water Rafting",
      descriptionEn: "Thrilling white water rafting adventures navigating pristine Himalayan rivers."
    },
    "Paraglidling": {
      nameEn: "Paragliding",
      descriptionEn: "Soar above scenic valleys with bird's-eye views of the snowcapped Annapurna range."
    }
  };

  for (const [name, data] of Object.entries(actUpdates)) {
    await db.collection("activities").updateOne({ name }, { $set: data });
  }
  console.log("Updated Activities");

  // 4. TOURS
  const tourTranslations = [
    {
      match: "Everest Base Camp",
      titleEn: "Everest Base Camp Trek – A Life-Changing Journey",
      summaryEn: "<p>Fulfill your dream of Everest on this legendary 14-day trek to Everest Base Camp. Suitable for beginners and experienced hikers alike, accompanied by certified local guides.</p>",
      overviewEn: "<p>The Everest Base Camp trek is one of the world's most iconic mountain journeys. Walk among the highest peaks on Earth, experience authentic Sherpa culture, and visit ancient monasteries in the Khumbu region.</p>",
      durationEn: "14 Days",
      difficultyEn: "Challenging",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "Reach the iconic Everest Base Camp (5,364m)",
        "Panoramic sunrise over Mt. Everest from Kala Patthar (5,545m)",
        "Experience vibrant Sherpa culture in Namche Bazaar",
        "Scenic flight into Lukla and mountain trails"
      ]
    },
    {
      match: "Aama Yangri",
      titleEn: "Amazing 5-Day Aama Yangri Trek from Kathmandu",
      summaryEn: "<p>Discover the untouched Helambu region and ascend the sacred peak of Aama Yangri (3,771m) with breathtaking views of the Langtang and Jugal Himal ranges.</p>",
      overviewEn: "<p>Aama Yangri is a hidden gem close to Kathmandu. This short trek offers rich Hyolmo culture, peaceful pine forests, and a 360-degree mountain panorama from the summit stupa.</p>",
      durationEn: "5 Days",
      difficultyEn: "Moderate",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "Summit the sacred Aama Yangri peak (3,771m)",
        "Untouched cultural trails of the Helambu valley",
        "Spectacular views of Langtang and Jugal ranges"
      ]
    },
    {
      match: "Homestay",
      titleEn: "Unique Homestay & Cultural Village Experience",
      summaryEn: "<p>Stay with local families in traditional Himalayan villages, cook authentic meals, and experience everyday rural life away from commercial tourist tracks.</p>",
      overviewEn: "<p>This community-based homestay experience lets you connect deeply with Nepali village life, supporting sustainable local tourism and creating lasting friendships.</p>",
      durationEn: "4 Days",
      difficultyEn: "Easy",
      destinationEn: "Nepal",
      categoryEn: ["Tours"],
      highlightsEn: [
        "Authentic homestays with welcoming local families",
        "Learn traditional Nepali home cooking and organic farming",
        "Participate in village storytelling and cultural dances"
      ]
    },
    {
      match: "Annapurna Circuit",
      titleEn: "Discover the Magic of the Annapurna Circuit Trek",
      summaryEn: "<p>Cross the high Thorong La Pass (5,416m) and traverse diverse ecosystems ranging from subtropical lowlands to arid Tibetan-style plateaus.</p>",
      overviewEn: "<p>The Annapurna Circuit is celebrated as one of the world's greatest classic treks. Journey through deep river gorges, sacred pilgrimage sites like Muktinath, and rugged mountain landscapes.</p>",
      durationEn: "16 Days",
      difficultyEn: "Challenging",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "Cross the legendary Thorong La Pass at 5,416 meters",
        "Visit the sacred temple of Muktinath",
        "Dramatic landscape transition from lush valleys to Tibetan plateau"
      ]
    },
    {
      match: "Langtang",
      titleEn: "Discover the Beauty of the Himalayas: Langtang Valley Trek",
      summaryEn: "<p>Explore the 'Valley of Glaciers' close to Kathmandu. Walk through lush rhododendron forests and reach Kyanjin Gompa beneath towering snow peaks.</p>",
      overviewEn: "<p>The Langtang Valley trek combines Tibetan-influenced Tamang culture with stunning alpine scenery, serene yak pastures, and easy accessibility from Kathmandu.</p>",
      durationEn: "8 Days",
      difficultyEn: "Moderate",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "Explore Kyanjin Gompa and traditional yak cheese factory",
        "Ascend Kyanjin Ri (4,773m) for panoramic valley views",
        "Warm hospitality in rebuilt Tamang heritage villages"
      ]
    },
    {
      match: "Yoga",
      titleEn: "Yoga & Meditation Retreat in Nepal",
      summaryEn: "<p>Harmonize mind, body, and soul with daily yoga and mindfulness meditation sessions overlooking serene Himalayan vistas.</p>",
      overviewEn: "<p>Recharge your spirit in peaceful retreat centers surrounded by nature. Experience daily guided yoga, sound healing, healthy organic cuisine, and gentle nature walks.</p>",
      durationEn: "7 Days",
      difficultyEn: "Easy",
      destinationEn: "Nepal",
      categoryEn: ["Tours"],
      highlightsEn: [
        "Daily morning and evening guided yoga & meditation",
        "Holistic wellness and Tibetan singing bowl sound healing",
        "Nourishing organic vegetarian meals in tranquil surroundings"
      ]
    },
    {
      match: "Poon Hill",
      titleEn: "Poon Hill & Annapurna Base Camp Trek",
      summaryEn: "<p>Combine the world-famous golden sunrise from Poon Hill with a trek into the magnificent natural amphitheater of Annapurna Base Camp (4,130m).</p>",
      overviewEn: "<p>Experience two of Nepal's best highlights in one incredible trek. Witness the sunrise illuminating Dhaulagiri and Annapurna, followed by an unforgettable stay at the foot of Annapurna I.</p>",
      durationEn: "12 Days",
      difficultyEn: "Moderate",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "Iconic sunrise over the Annapurna & Dhaulagiri ranges from Poon Hill (3,210m)",
        "360-degree mountain amphitheater at Annapurna Base Camp (4,130m)",
        "Relax in natural hot springs at Jhinu Danda"
      ]
    },
    {
      match: "Dolpo",
      titleEn: "Mystic Dolpo – The Hidden Gem of the Himalayas",
      summaryEn: "<p>Step into the mystical, remote realm of Upper and Lower Dolpo. Discover deep turquoise lakes, ancient Bon monasteries, and pristine wilderness.</p>",
      overviewEn: "<p>Dolpo remains one of Nepal's most secluded frontiers. Trek through wild trans-Himalayan landscapes, visit crystal-clear Phoksundo Lake, and experience centuries-old traditions preserved in time.</p>",
      durationEn: "18 Days",
      difficultyEn: "Difficult",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "The deep sapphire waters of Shey Phoksundo Lake",
        "Ancient Bon and Tibetan Buddhist monasteries",
        "Secluded high-altitude desert plateaus and rare wildlife"
      ]
    },
    {
      match: "Motorsykkeltur",
      titleEn: "Motorcycle Adventure to Upper Mustang, Nepal",
      summaryEn: "<p>Ride the rugged Himalayan roads on legendary Royal Enfield motorbikes into the forbidden kingdom of Lo Manthang in Upper Mustang.</p>",
      overviewEn: "<p>An exhilarating two-wheeled expedition through deep canyons, wind-carved cliffs, medieval walled cities, and high mountain passes on the ancient salt trading route.</p>",
      durationEn: "11 Days",
      difficultyEn: "Challenging",
      destinationEn: "Nepal",
      categoryEn: ["Tours"],
      highlightsEn: [
        "Ride legendary Royal Enfield motorbikes into Upper Mustang",
        "Explore the historic walled capital of Lo Manthang",
        "Spectacular riding through the Kali Gandaki river canyon"
      ]
    },
    {
      match: "Mardi Himal",
      titleEn: "Mardi Himal Base Camp Trek",
      summaryEn: "<p>A stunning ridge trek getting you up close to the iconic Machapuchare (Fishtail) and Annapurna South with fewer crowds.</p>",
      overviewEn: "<p>The Mardi Himal trek follows narrow alpine ridges through enchanted rhododendron forests, leading to high-elevation viewpoints with jaw-dropping mountain views.</p>",
      durationEn: "6 Days",
      difficultyEn: "Moderate",
      destinationEn: "Nepal",
      categoryEn: ["Trekking"],
      highlightsEn: [
        "Spectacular close-up views of Mount Machapuchare (Fishtail)",
        "Scenic ridge trail with panoramic sunrise vistas",
        "Peaceful, less-crowded alternative in the Annapurna sanctuary"
      ]
    },
    {
      match: "Chitwan",
      titleEn: "Pokhara & Chitwan Jungle Safari Adventure",
      summaryEn: "<p>Combine the tranquil lakeside beauty of Pokhara with thrilling jungle wildlife safaris, canoeing, and cultural shows in Chitwan National Park.</p>",
      overviewEn: "<p>A perfect family and wildlife holiday combining lakeside relaxation in Pokhara, Himalayan sunrise from Sarangkot, and jungle safaris seeking rhinos and tigers in Chitwan.</p>",
      durationEn: "7 Days",
      difficultyEn: "Easy",
      destinationEn: "Nepal",
      categoryEn: ["Jungelsafari", "Tours"],
      highlightsEn: [
        "Jeep and canoe wildlife safaris in Chitwan National Park",
        "Spot endangered greater one-horned rhinos and exotic birds",
        "Boating on Phewa Lake and sunrise from Sarangkot in Pokhara"
      ]
    },
    {
      match: "Delhi, Agra",
      titleEn: "Golden Triangle of India: Delhi, Agra & Jaipur",
      summaryEn: "<p>Experience India's iconic Golden Triangle. Marvel at the Taj Mahal, explore majestic Rajput forts, and experience rich royal heritage.</p>",
      overviewEn: "<p>A royal cultural journey through northern India visiting Old and New Delhi, the legendary Taj Mahal at sunrise in Agra, and the pink-hued palaces of Jaipur.</p>",
      durationEn: "7 Days",
      difficultyEn: "Easy",
      destinationEn: "India",
      categoryEn: ["Tours"],
      highlightsEn: [
        "Sunrise tour of the world-famous Taj Mahal in Agra",
        "Explore Amber Fort and City Palace in Jaipur",
        "Discover the vibrant markets and monuments of Delhi"
      ]
    }
  ];

  const allTours = await db.collection("tours").find({}).toArray();
  for (const tour of allTours) {
    const match = tourTranslations.find(t => tour.title.toLowerCase().includes(t.match.toLowerCase()));
    if (match) {
      const update = {
        titleEn: match.titleEn,
        summaryEn: match.summaryEn,
        overviewEn: match.overviewEn,
        durationEn: match.durationEn,
        difficultyEn: match.difficultyEn,
        destinationEn: match.destinationEn,
        categoryEn: match.categoryEn,
        highlightsEn: match.highlightsEn,
        priceIncludesEn: (tour.priceIncludes || []).map(inc => {
          if (inc.toLowerCase().includes('guide')) return 'Licensed English-speaking mountain guide';
          if (inc.toLowerCase().includes('hotell') || inc.toLowerCase().includes('overnatting')) return 'Accommodation in teahouses & hotels';
          if (inc.toLowerCase().includes('frokost') || inc.toLowerCase().includes('måltid')) return 'All meals during the trek';
          if (inc.toLowerCase().includes('tillatelse') || inc.toLowerCase().includes('permit')) return 'All trekking permits and national park fees';
          if (inc.toLowerCase().includes('transport') || inc.toLowerCase().includes('fly')) return 'All domestic flights and ground transfers';
          return inc;
        }),
        priceExcludesEn: (tour.priceExcludes || []).map(exc => {
          if (exc.toLowerCase().includes('internasjonale') || exc.toLowerCase().includes('flybilletter')) return 'International flights to and from Nepal';
          if (exc.toLowerCase().includes('forsikring')) return 'Travel and medical rescue insurance';
          if (exc.toLowerCase().includes('visum')) return 'Nepal entry visa fees';
          if (exc.toLowerCase().includes('drikke') || exc.toLowerCase().includes('snacks')) return 'Personal snacks, mineral water & soft drinks';
          if (exc.toLowerCase().includes('tips')) return 'Tips for guides and porters';
          return exc;
        }),
        itinerary: (tour.itinerary || []).map(it => ({
          ...it,
          titleEn: it.titleEn || it.title,
          detailsEn: it.detailsEn || it.details
        }))
      };
      await db.collection("tours").updateOne({ _id: tour._id }, { $set: update });
      console.log(`Updated tour: ${tour.title} -> ${match.titleEn}`);
    } else {
      // Set basic titleEn if not matched
      await db.collection("tours").updateOne({ _id: tour._id }, {
        $set: {
          titleEn: tour.titleEn || tour.title,
          summaryEn: tour.summaryEn || tour.summary,
          destinationEn: tour.destinationEn || tour.destination,
          durationEn: tour.durationEn || tour.duration
        }
      });
    }
  }

  // 5. BLOGS
  const blogTranslations = [
    {
      match: "ikke er et billig eventyr",
      titleEn: "Why the Everest Base Camp Trek in Nepal Is Not a Cheap Adventure",
      summaryEn: "A transparent breakdown of costs for trekking to Everest Base Camp, covering permits, logistics, safety, and gear.",
      categoryEn: "Travel Tips"
    },
    {
      match: "Trekking og Tur i Nepal",
      titleEn: "Trekking and Hiking in Nepal: A Complete Starter Guide",
      summaryEn: "Everything you need to know before embarking on your first Himalayan trek in Nepal.",
      categoryEn: "Guide"
    },
    {
      match: "Topp 5 Eventyrturer",
      titleEn: "Top 5 Adventure Tours in Nepal for Nordic Travelers",
      summaryEn: "From classic mountain treks to untamed jungle safaris—the best Nepal adventures curated for travelers.",
      categoryEn: "Inspiration"
    },
    {
      match: "paradis",
      titleEn: "A Glimpse of Paradise: Experience the Hidden Side of Nepal",
      summaryEn: "Explore the lesser-known, authentic mountain trails and cultural valleys away from mass tourism.",
      categoryEn: "Culture"
    },
    {
      match: "vakreste Fjellene",
      titleEn: "The 5 Most Beautiful Mountains in Nepal: A Hiker's Guide",
      summaryEn: "Discover Machapuchare, Ama Dablam, Annapurna, and more iconic Himalayan peaks.",
      categoryEn: "Mountains"
    },
    {
      match: "Pakke",
      titleEn: "What to Pack When Traveling to Nepal: An Essential Packing List",
      summaryEn: "The ultimate gear and clothing checklist for trekking and exploring Nepal in all seasons.",
      categoryEn: "Travel Tips"
    },
    {
      match: "Disabilities",
      titleEn: "Helicopter Tours in Nepal: Accessible Himalayan Views for Everyone",
      summaryEn: "How scenic helicopter flights make Everest and the Himalayas accessible to all travelers.",
      categoryEn: "Adventure"
    },
    {
      match: "Formål",
      titleEn: "A Journey with Purpose: Your Adventure – Their Hope",
      summaryEn: "How 5% of your trip booking directly supports street dogs and welfare projects across Nepal.",
      categoryEn: "Community"
    }
  ];

  const allBlogs = await db.collection("blogs").find({}).toArray();
  for (const blog of allBlogs) {
    const match = blogTranslations.find(b => blog.title.toLowerCase().includes(b.match.toLowerCase()));
    if (match) {
      await db.collection("blogs").updateOne({ _id: blog._id }, {
        $set: {
          titleEn: match.titleEn,
          summaryEn: match.summaryEn,
          categoryEn: match.categoryEn
        }
      });
      console.log(`Updated blog: ${blog.title} -> ${match.titleEn}`);
    } else {
      await db.collection("blogs").updateOne({ _id: blog._id }, {
        $set: {
          titleEn: blog.titleEn || blog.title,
          summaryEn: blog.summaryEn || blog.summary
        }
      });
    }
  }

  console.log("All database translations populated successfully!");
  process.exit(0);
}

populateTranslations().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
