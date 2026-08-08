const mongoose = require("mongoose");

async function setup() {
  try {
    const MONGODB_URI = "mongodb+srv://sajan123:sq06mKiDQOJreph5@cluster0.tvjvl7.mongodb.net/nepalvibb";
    console.log(`Connecting to: ${MONGODB_URI.replace(/:.*@/, ':****@')}`);
    
    const opts = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 0,
    };

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    await mongoose.connect(MONGODB_URI, opts);
    console.log("Connected successfully");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`Database has ${collections.length} collections`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.code === 'ENOTFOUND') {
      console.error("\nDNS resolution failed. This may be due to:");
      console.error("1. Network connectivity issues");
      console.error("2. SRV record not properly configured in MongoDB Atlas");
      console.error("3. Firewall rules blocking port 25060 (SRV)");
    }
  }
}

if (require.main === module) {
  setup();
}

module.exports = setup;
