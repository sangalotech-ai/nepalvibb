async function seedToAtlas() {
  try {
    const mongoose = require("mongoose");
    const bcrypt = require("bcryptjs");
    
    const MONGODB_URI = "mongodb+srv://sajan123:sq06mKiDQOJreph5@cluster0.tvjvl7.mongodb.net/nepalvibb";
    console.log(`Connecting to MongoDB Atlas at ${MONGODB_URI.replace(/:.*@/, ':****@')}`);
    
    const opts = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log("Successfully connected to MongoDB Atlas");

    const Schema = mongoose.Schema;

    // ---- Define schemas ----
    const RoleSchema = new Schema({ name: String, description: String, permissions: [String] }, { timestamps: true });

    const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);

    // Clear existing data
    await Role.deleteMany({});
    console.log("Cleared existing Roles");

    // Seed Roles
    const roles = await Role.insertMany([
      { name: "SUPER_ADMIN", description: "Super Administrator", permissions: ["all"] },
      { name: "COMPANY_ADMIN", description: "Company Administrator", permissions: ["all"] },
      { name: "SALES_MANAGER", description: "Sales Manager", permissions: ["read", "write", "approve"] },
      { name: "AREA_SALES_MANAGER", description: "Area Sales Manager", permissions: ["read", "write"] },
      { name: "MEDICAL_REPRESENTATIVE", description: "Medical Representative", permissions: ["read", "write"] },
      { name: "DISTRIBUTOR", description: "Distributor", permissions: ["read"] },
      { name: "RETAILER", description: "Retailer", permissions: ["read"] },
      { name: "STOCKIST", description: "Stockist", permissions: ["read"] },
    ]);
    console.log(`Seeded ${roles.length} roles`);
    console.log("Mongoose disconnected");

  } catch (error) {
    console.error("Error connecting or seeding:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

if (require.main === module) {
  seedToAtlas();
}

module.exports = seedToAtlas;