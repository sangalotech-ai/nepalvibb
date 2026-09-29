import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = 'mongodb+srv://sajankafle9841:zlxJdjZNiGxljg0e@cluster0.dwtxp87.mongodb.net/nepalvibb';
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveBase64Image(base64Str, prefix = 'img') {
  if (typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  const match = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!match) return base64Str;
  
  let ext = match[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (ext.includes('svg')) ext = 'svg';
  
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  
  fs.writeFileSync(filePath, buffer);
  console.log(`Saved: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
  return `/uploads/${filename}`;
}

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Banners
  const banners = await mongoose.connection.db.collection('banners').find({}).toArray();
  for (const banner of banners) {
    if (banner.image && banner.image.startsWith('data:image/')) {
      const newUrl = saveBase64Image(banner.image, `banner-${banner.title?.replace(/[^a-z0-9]/gi, '_') || 'b'}`);
      await mongoose.connection.db.collection('banners').updateOne(
        { _id: banner._id },
        { $set: { image: newUrl } }
      );
    }
  }

  // 2. HomeContent
  const homeContents = await mongoose.connection.db.collection('homecontents').find({}).toArray();
  for (const hc of homeContents) {
    let updated = false;
    const updateFields = {};

    if (hc.whoWeAre?.image1?.startsWith('data:image/')) {
      updateFields['whoWeAre.image1'] = saveBase64Image(hc.whoWeAre.image1, 'who-we-are-1');
      updated = true;
    }
    if (hc.whoWeAre?.image2?.startsWith('data:image/')) {
      updateFields['whoWeAre.image2'] = saveBase64Image(hc.whoWeAre.image2, 'who-we-are-2');
      updated = true;
    }
    if (hc.purpose?.image?.startsWith('data:image/')) {
      updateFields['purpose.image'] = saveBase64Image(hc.purpose.image, 'purpose-main');
      updated = true;
    }

    if (updated) {
      await mongoose.connection.db.collection('homecontents').updateOne(
        { _id: hc._id },
        { $set: updateFields }
      );
    }
  }

  // 3. Tours
  const tours = await mongoose.connection.db.collection('tours').find({}).toArray();
  for (const tour of tours) {
    let updated = false;
    const updateFields = {};

    if (tour.image && tour.image.startsWith('data:image/')) {
      updateFields['image'] = saveBase64Image(tour.image, `tour-${tour.slug || 'img'}`);
      updated = true;
    }

    if (Array.isArray(tour.gallery)) {
      const newGallery = tour.gallery.map((img, idx) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          updated = true;
          return saveBase64Image(img, `tour-${tour.slug || 'img'}-gal-${idx}`);
        }
        return img;
      });
      if (updated) {
        updateFields['gallery'] = newGallery;
      }
    }

    if (Array.isArray(tour.itinerary)) {
      let itinUpdated = false;
      const newItin = tour.itinerary.map((item, idx) => {
        if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
          itinUpdated = true;
          return { ...item, image: saveBase64Image(item.image, `tour-${tour.slug || 'img'}-itin-${idx}`) };
        }
        return item;
      });
      if (itinUpdated) {
        updateFields['itinerary'] = newItin;
        updated = true;
      }
    }

    if (updated) {
      await mongoose.connection.db.collection('tours').updateOne(
        { _id: tour._id },
        { $set: updateFields }
      );
    }
  }

  // 4. Activities
  const activities = await mongoose.connection.db.collection('activities').find({}).toArray();
  for (const act of activities) {
    if (act.image && act.image.startsWith('data:image/')) {
      const newUrl = saveBase64Image(act.image, `act-${act.slug || 'img'}`);
      await mongoose.connection.db.collection('activities').updateOne(
        { _id: act._id },
        { $set: { image: newUrl } }
      );
    }
  }

  // 5. Blogs
  const blogs = await mongoose.connection.db.collection('blogs').find({}).toArray();
  for (const blog of blogs) {
    if (blog.image && blog.image.startsWith('data:image/')) {
      const newUrl = saveBase64Image(blog.image, `blog-${blog.slug || 'img'}`);
      await mongoose.connection.db.collection('blogs').updateOne(
        { _id: blog._id },
        { $set: { image: newUrl } }
      );
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
