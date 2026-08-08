const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    await mongoose.connect("mongodb://localhost:27017/dbsfa");
    console.log("Connected to MongoDB\n");

    const Schema = mongoose.Schema;

    // ---- Define schemas ----
    const RoleSchema = new Schema({ name: String, description: String, permissions: [String] }, { timestamps: true });
    const UserSchema = new Schema({ firstName: String, lastName: String, email: String, passwordHash: String, phone: String, role: { type: Schema.Types.ObjectId, ref: "Role" }, isActive: Boolean, territory: String, address: String, city: String }, { timestamps: true });
    const CategorySchema = new Schema({ name: String, description: String, isActive: Boolean }, { timestamps: true });
    const BrandSchema = new Schema({ name: String, manufacturer: String, isActive: Boolean }, { timestamps: true });
    const ProductSchema = new Schema({ name: String, sku: String, description: String, category: { type: Schema.Types.ObjectId, ref: "Category" }, brand: { type: Schema.Types.ObjectId, ref: "Brand" }, price: Number, mrp: Number, ptr: Number, pts: Number, packSize: String, composition: String, isActive: Boolean, isAvailable: Boolean }, { timestamps: true });
    const CustomerSchema = new Schema({ name: String, type: String, email: String, phone: String, address: String, city: String, state: String, creditLimit: Number, outstandingBalance: Number, assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, isActive: Boolean }, { timestamps: true });
    const OrderSchema = new Schema({ orderNumber: String, customer: { type: Schema.Types.ObjectId, ref: "Customer" }, employee: { type: Schema.Types.ObjectId, ref: "User" }, orderDate: Date, status: String, items: [{ product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number, unitPrice: Number, total: Number }], subtotal: Number, discount: Number, tax: Number, total: Number, paymentStatus: String, paidAmount: Number, outstandingAmount: Number, notes: String }, { timestamps: true });
    const PaymentSchema = new Schema({ paymentNumber: String, receiptNumber: { type: String }, customer: { type: Schema.Types.ObjectId, ref: "Customer" }, invoice: { type: Schema.Types.ObjectId, ref: "Order" }, salesRep: { type: Schema.Types.ObjectId, ref: "User" }, amount: Number, paymentMethod: String, paymentDate: Date, referenceNumber: String, status: String, notes: String }, { timestamps: true });
    const VisitSchema = new Schema({ visitNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, customer: { type: Schema.Types.ObjectId, ref: "Customer" }, plannedDate: Date, outcome: String, notes: String, photos: [String] }, { timestamps: true });
    const AttendanceSchema = new Schema({ employee: { type: Schema.Types.ObjectId, ref: "User" }, date: Date, status: String, workingHours: Number, notes: String }, { timestamps: true });
    const LeaveSchema = new Schema({ employee: { type: Schema.Types.ObjectId, ref: "User" }, leaveType: String, startDate: Date, endDate: Date, totalDays: Number, reason: String, status: String }, { timestamps: true });
    const BeatPlanSchema = new Schema({ beatPlanNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, planDate: Date, type: String, area: String, customers: [{ customer: { type: Schema.Types.ObjectId, ref: "Customer" }, sequence: Number, visitType: String, isCompleted: Boolean }], status: String, notes: String }, { timestamps: true });
    const TourPlanSchema = new Schema({ tourPlanNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, purpose: String, tourStartDate: Date, tourEndDate: Date, travelMode: String, estimatedBudget: Number, status: String, notes: String }, { timestamps: true });
    const ExpenseSchema = new Schema({ expenseNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, expenseType: String, amount: Number, expenseDate: Date, description: String, status: String }, { timestamps: true });
    const StockTakeSchema = new Schema({ stockTakeNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, customer: { type: Schema.Types.ObjectId, ref: "Customer" }, stockDate: Date, type: String, totalItems: Number, totalQuantity: Number, status: String, notes: String }, { timestamps: true });
    const TargetSchema = new Schema({ targetNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, period: String, startDate: Date, endDate: Date, overallTargetValue: Number, overallAchievedValue: Number, achievementPercentage: Number, status: String, assignedBy: { type: Schema.Types.ObjectId, ref: "User" }, notes: String }, { timestamps: true });
    const SalesTargetSchema = new Schema({ targetNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, targetType: String, periodStart: Date, periodEnd: Date, targetValue: Number, achievedValue: Number, achievementPercentage: Number, status: String, assignedBy: { type: Schema.Types.ObjectId, ref: "User" }, notes: String }, { timestamps: true });
    const GiftSchema = new Schema({ giftNumber: String, name: String, description: String, category: String, unitCost: Number, totalQuantity: Number, availableQuantity: Number, issuedQuantity: Number, isActive: Boolean }, { timestamps: true });
    const SampleSchema = new Schema({ sampleNumber: String, product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number, receivedDate: Date, receivedBy: { type: Schema.Types.ObjectId, ref: "User" }, purpose: String, status: String, notes: String }, { timestamps: true });
    const SchemeSchema = new Schema({ schemeNumber: String, name: String, description: String, type: String, discountType: String, discountValue: Number, startDate: Date, endDate: Date, isActive: Boolean }, { timestamps: true });
    const AreaSchema = new Schema({ areaNumber: String, name: String, description: String, city: String, state: String, territory: String, isActive: Boolean }, { timestamps: true });
    const PartyLocationSchema = new Schema({ customer: { type: Schema.Types.ObjectId, ref: "Customer" }, address: String, city: String, state: String, source: String, isVerified: Boolean }, { timestamps: true });
    const AnnouncementSchema = new Schema({ announcementNumber: String, title: String, content: String, type: String, priority: String, isActive: Boolean, startDate: Date, sentBy: { type: Schema.Types.ObjectId, ref: "User" } }, { timestamps: true });
    const FileShareSchema = new Schema({ fileNumber: String, title: String, description: String, category: String, fileName: String, fileSize: Number, uploadedBy: { type: Schema.Types.ObjectId, ref: "User" }, isActive: Boolean }, { timestamps: true });
    const WorkLogSchema = new Schema({ logNumber: String, employee: { type: Schema.Types.ObjectId, ref: "User" }, date: Date, totalHours: Number, status: String, remarks: String }, { timestamps: true });
    const CustomFormSchema = new Schema({ formNumber: String, title: String, type: String, isActive: Boolean, isPublished: Boolean }, { timestamps: true });
    const NotificationSchema = new Schema({ notificationNumber: String, title: String, message: String, type: String, priority: String, recipientType: String, channels: [String], status: String }, { timestamps: true });
    const VanSchema = new Schema({ vanNumber: String, name: String, driver: { type: Schema.Types.ObjectId, ref: "User" }, vehicleNumber: String, route: String, status: String, inventory: [{ product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number }], isActive: Boolean }, { timestamps: true });
    const DispatchSchema = new Schema({ dispatchNumber: String, order: { type: Schema.Types.ObjectId, ref: "Order" }, van: { type: Schema.Types.ObjectId, ref: "Van" }, dispatchedBy: { type: Schema.Types.ObjectId, ref: "User" }, dispatchDate: Date, status: String, deliveryDate: Date, receivedBy: String, items: [{ product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number }] }, { timestamps: true });
    const ReturnSchema = new Schema({ returnNumber: String, customer: { type: Schema.Types.ObjectId, ref: "Customer" }, employee: { type: Schema.Types.ObjectId, ref: "User" }, returnDate: Date, reason: String, status: String, items: [{ product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number, condition: String }], totalAmount: Number, restocked: Boolean, creditNoteGenerated: Boolean }, { timestamps: true });

    const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
    const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
    const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
    const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
    const Order_ = mongoose.models.Order || mongoose.model("Order", OrderSchema);
    const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
    const Visit = mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
    const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
    const Leave = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);
    const BeatPlan = mongoose.models.BeatPlan || mongoose.model("BeatPlan", BeatPlanSchema);
    const TourPlan = mongoose.models.TourPlan || mongoose.model("TourPlan", TourPlanSchema);
    const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
    const StockTake = mongoose.models.StockTake || mongoose.model("StockTake", StockTakeSchema);
    const Target = mongoose.models.Target || mongoose.model("Target", TargetSchema);
    const SalesTarget = mongoose.models.SalesTarget || mongoose.model("SalesTarget", SalesTargetSchema);
    const Gift = mongoose.models.Gift || mongoose.model("Gift", GiftSchema);
    const Sample = mongoose.models.Sample || mongoose.model("Sample", SampleSchema);
    const Scheme = mongoose.models.Scheme || mongoose.model("Scheme", SchemeSchema);
    const Area = mongoose.models.Area || mongoose.model("Area", AreaSchema);
    const PartyLocation = mongoose.models.PartyLocation || mongoose.model("PartyLocation", PartyLocationSchema);
    const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
    const FileShare = mongoose.models.FileShare || mongoose.model("FileShare", FileShareSchema);
    const WorkLog = mongoose.models.WorkLog || mongoose.model("WorkLog", WorkLogSchema);
    const CustomForm = mongoose.models.CustomForm || mongoose.model("CustomForm", CustomFormSchema);
    const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
    const Van = mongoose.models.Van || mongoose.model("Van", VanSchema);
    const Dispatch = mongoose.models.Dispatch || mongoose.model("Dispatch", DispatchSchema);
    const Return = mongoose.models.Return || mongoose.model("Return", ReturnSchema);

    // ---- Clear existing data ----
    const models = [Role, User, Category, Brand, Product, Customer, Order_, Payment, Visit, Attendance, Leave, BeatPlan, TourPlan, Expense, StockTake, Target, SalesTarget, Gift, Sample, Scheme, Area, PartyLocation, Announcement, FileShare, WorkLog, CustomForm, Notification];
    for (const m of models) await m.deleteMany({});
    console.log("Cleared existing data");

    // ---- Seed Roles ----
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

    const roleMap = {};
    for (const r of roles) roleMap[r.name] = r._id;

    // ---- Seed Users ----
    const adminPassHash = await bcrypt.hash("admin123", 12);
    const companyAdminPassHash = await bcrypt.hash("company123", 12);
    const salesManagerPassHash = await bcrypt.hash("sales123", 12);
    const areaSalesManagerPassHash = await bcrypt.hash("area123", 12);
    const medicalRepPassHash = await bcrypt.hash("mr123", 12);
    const distPassHash = await bcrypt.hash("dist123", 12);
    const retailPassHash = await bcrypt.hash("retail123", 12);
    const stockPassHash = await bcrypt.hash("stock123", 12);
    const legacyPassHash = await bcrypt.hash("Admin@123", 12);
    
    const users = await User.insertMany([
      { firstName: "Super", lastName: "Admin", email: "superadmin@pharma.com", passwordHash: legacyPassHash, phone: "9999999999", role: roleMap["SUPER_ADMIN"], isActive: true, territory: "Global", city: "Kathmandu" },
      { firstName: "Company", lastName: "Admin", email: "companyadmin@pharma.com", passwordHash: legacyPassHash, phone: "9999999998", role: roleMap["COMPANY_ADMIN"], isActive: true, territory: "Global", city: "Kathmandu" },
      { firstName: "Sales", lastName: "Manager", email: "salesmanager@pharma.com", passwordHash: legacyPassHash, phone: "9800000001", role: roleMap["SALES_MANAGER"], isActive: true, territory: "Bagmati", city: "Kathmandu" },
      { firstName: "Area", lastName: "Manager", email: "areamanager@pharma.com", passwordHash: legacyPassHash, phone: "9800000002", role: roleMap["AREA_SALES_MANAGER"], isActive: true, territory: "Lalitpur", city: "Lalitpur" },
      { firstName: "Medical", lastName: "Representative", email: "mr@pharma.com", passwordHash: legacyPassHash, phone: "9999999995", role: roleMap["MEDICAL_REPRESENTATIVE"], isActive: true, territory: "Andheri Area", city: "Mumbai" },
      { firstName: "Hari", lastName: "Gurung", email: "hari@pharma.com", passwordHash: legacyPassHash, phone: "9800000003", role: roleMap["MEDICAL_REPRESENTATIVE"], isActive: true, territory: "Pokhara", city: "Pokhara" },
      { firstName: "Gita", lastName: "Thapa", email: "gita@pharma.com", passwordHash: legacyPassHash, phone: "9800000004", role: roleMap["MEDICAL_REPRESENTATIVE"], isActive: true, territory: "Chitwan", city: "Bharatpur" },
      { firstName: "Krishna", lastName: "Adhikari", email: "krishna@pharma.com", passwordHash: legacyPassHash, phone: "9800000005", role: roleMap["MEDICAL_REPRESENTATIVE"], isActive: true, territory: "Biratnagar", city: "Biratnagar" },
      { firstName: "Distributor", lastName: "House", email: "distributor@pharma.com", passwordHash: legacyPassHash, phone: "9999999994", role: roleMap["DISTRIBUTOR"], isActive: true, territory: "National", city: "Kathmandu" },
      { firstName: "Retail", lastName: "Store", email: "retailer@pharma.com", passwordHash: legacyPassHash, phone: "9999999993", role: roleMap["RETAILER"], isActive: true, territory: "Local", city: "Kathmandu" },
      { firstName: "Stockist", lastName: "Hub", email: "stockist@pharma.com", passwordHash: legacyPassHash, phone: "9999999992", role: roleMap["STOCKIST"], isActive: true, territory: "Warehouse", city: "Kathmandu" },
      { firstName: "Super", lastName: "Admin", email: "admin@pharmasfa.com", passwordHash: adminPassHash, phone: "9999999997", role: roleMap["SUPER_ADMIN"], isActive: true, territory: "Global", city: "Kathmandu" },
      { firstName: "Company", lastName: "Admin", email: "companyadmin@pharma.com", passwordHash: companyAdminPassHash, phone: "9999999996", role: roleMap["COMPANY_ADMIN"], isActive: true, territory: "Global", city: "Kathmandu" },
      { firstName: "Sales", lastName: "Manager", email: "salesmanager@pharma.com", passwordHash: salesManagerPassHash, phone: "9800000000", role: roleMap["SALES_MANAGER"], isActive: true, territory: "Bagmati", city: "Kathmandu" },
      { firstName: "Area", lastName: "Manager", email: "areamanager@pharma.com", passwordHash: areaSalesManagerPassHash, phone: "9800000001", role: roleMap["AREA_SALES_MANAGER"], isActive: true, territory: "Lalitpur", city: "Lalitpur" },
      { firstName: "Medical", lastName: "Representative", email: "mr@pharma.com", passwordHash: medicalRepPassHash, phone: "9999999995", role: roleMap["MEDICAL_REPRESENTATIVE"], isActive: true, territory: "Andheri Area", city: "Mumbai" },
    ]);
    console.log(`Seeded ${users.length} users`);

    const userByRole = {};
    for (const u of users) {
      const r = await Role.findById(u.role);
      if (r) userByRole[r.name] = u._id;
    }
    const mrId = userByRole["MEDICAL_REPRESENTATIVE"];
    const smId = userByRole["SALES_MANAGER"];
    const amId = userByRole["AREA_SALES_MANAGER"];
    const caId = userByRole["COMPANY_ADMIN"];

    // ---- Seed Categories ----
    const categories = await Category.insertMany([
      { name: "Antibiotics", description: "Antibacterial medications", isActive: true },
      { name: "Analgesics", description: "Pain relief medications", isActive: true },
      { name: "Antihistamines", description: "Allergy medications", isActive: true },
      { name: "Vitamins & Supplements", description: "Nutritional supplements", isActive: true },
      { name: "Cardiovascular", description: "Heart and blood pressure medications", isActive: true },
      { name: "Diabetes Care", description: "Anti-diabetic medications", isActive: true },
      { name: "Gastrointestinal", description: "Digestive health medications", isActive: true },
    ]);
    const catMap = {};
    for (const c of categories) catMap[c.name] = c._id;
    console.log(`Seeded ${categories.length} categories`);

    // ---- Seed Brands ----
    const brands = await Brand.insertMany([
      { name: "Nepal Pharma Ltd", manufacturer: "Nepal Pharma Ltd", isActive: true },
      { name: "Kathmandu Drugs", manufacturer: "Kathmandu Drugs Pvt Ltd", isActive: true },
      { name: "Himalaya Healthcare", manufacturer: "Himalaya Healthcare Corp", isActive: true },
      { name: "Everest Medicos", manufacturer: "Everest Medicos Pvt Ltd", isActive: true },
      { name: "Sagarmatha Biotech", manufacturer: "Sagarmatha Biotech Ltd", isActive: true },
    ]);
    const brandMap = {};
    for (const b of brands) brandMap[b.name] = b._id;
    console.log(`Seeded ${brands.length} brands`);

    // ---- Seed Products ----
    const products = await Product.insertMany([
      { name: "Amoxicillin 500mg", sku: "AMX-500", category: catMap["Antibiotics"], brand: brandMap["Nepal Pharma Ltd"], price: 120, mrp: 150, ptr: 135, pts: 130, packSize: "10x10 Capsules", composition: "Amoxicillin 500mg", isActive: true, isAvailable: true },
      { name: "Paracetamol 650mg", sku: "PAR-650", category: catMap["Analgesics"], brand: brandMap["Kathmandu Drugs"], price: 45, mrp: 60, ptr: 52, pts: 48, packSize: "10x10 Tablets", composition: "Paracetamol 650mg", isActive: true, isAvailable: true },
      { name: "Cetirizine 10mg", sku: "CET-10", category: catMap["Antihistamines"], brand: brandMap["Himalaya Healthcare"], price: 35, mrp: 50, ptr: 42, pts: 38, packSize: "10x10 Tablets", composition: "Cetirizine HCl 10mg", isActive: true, isAvailable: true },
      { name: "Vitamin C 500mg", sku: "VITC-500", category: catMap["Vitamins & Supplements"], brand: brandMap["Everest Medicos"], price: 80, mrp: 100, ptr: 90, pts: 85, packSize: "15x10 Tablets", composition: "Ascorbic Acid 500mg", isActive: true, isAvailable: true },
      { name: "Amlodipine 5mg", sku: "AML-5", category: catMap["Cardiovascular"], brand: brandMap["Sagarmatha Biotech"], price: 65, mrp: 85, ptr: 72, pts: 68, packSize: "10x10 Tablets", composition: "Amlodipine Besylate 5mg", isActive: true, isAvailable: true },
      { name: "Metformin 500mg", sku: "MET-500", category: catMap["Diabetes Care"], brand: brandMap["Nepal Pharma Ltd"], price: 55, mrp: 70, ptr: 62, pts: 58, packSize: "10x10 Tablets", composition: "Metformin HCl 500mg", isActive: true, isAvailable: true },
      { name: "Omeprazole 20mg", sku: "OME-20", category: catMap["Gastrointestinal"], brand: brandMap["Kathmandu Drugs"], price: 40, mrp: 55, ptr: 47, pts: 42, packSize: "10x10 Capsules", composition: "Omeprazole 20mg", isActive: true, isAvailable: true },
      { name: "Ibuprofen 400mg", sku: "IBU-400", category: catMap["Analgesics"], brand: brandMap["Himalaya Healthcare"], price: 50, mrp: 65, ptr: 57, pts: 52, packSize: "10x10 Tablets", composition: "Ibuprofen 400mg", isActive: true, isAvailable: true },
      { name: "Azithromycin 500mg", sku: "AZI-500", category: catMap["Antibiotics"], brand: brandMap["Everest Medicos"], price: 180, mrp: 220, ptr: 200, pts: 190, packSize: "6 Tablets", composition: "Azithromycin 500mg", isActive: true, isAvailable: true },
      { name: "Multivitamin Daily", sku: "MVIT-D", category: catMap["Vitamins & Supplements"], brand: brandMap["Sagarmatha Biotech"], price: 95, mrp: 120, ptr: 108, pts: 100, packSize: "30 Tablets", composition: "Multivitamin + Minerals", isActive: true, isAvailable: true },
    ]);
    console.log(`Seeded ${products.length} products`);

    // ---- Seed Customers (Distributors & Retailers) ----
    const customers = await Customer.insertMany([
      { name: "Kathmandu Medical Hall", type: "RETAILER", email: "kathamdu@med.com", phone: "9812345678", address: "New Road", city: "Kathmandu", state: "Bagmati", creditLimit: 100000, outstandingBalance: 25000, assignedTo: mrId, isActive: true, location: { lat: 27.7017, lng: 85.3206 }, geoFenceRadius: 100 },
      { name: "Basantapur Pharma", type: "RETAILER", email: "basantapur@pharma.com", phone: "9812345679", address: "Basantapur", city: "Kathmandu", state: "Bagmati", creditLimit: 75000, outstandingBalance: 15000, assignedTo: mrId, isActive: true, location: { lat: 27.7042, lng: 85.3076 }, geoFenceRadius: 100 },
      { name: "Pokhara Medical Store", type: "RETAILER", email: "pokhara@med.com", phone: "9812345680", address: "Lakeside", city: "Pokhara", state: "Gandaki", creditLimit: 50000, outstandingBalance: 8000, assignedTo: mrId, isActive: true, location: { lat: 28.2096, lng: 83.9856 }, geoFenceRadius: 100 },
      { name: "Bharatpur Pharmacy", type: "RETAILER", email: "bharatpur@pharma.com", phone: "9812345681", address: "Narayangarh", city: "Bharatpur", state: "Bagmati", creditLimit: 60000, outstandingBalance: 12000, assignedTo: mrId, isActive: true, location: { lat: 27.6833, lng: 84.4333 }, geoFenceRadius: 100 },
      { name: "Biratnagar Drug House", type: "DISTRIBUTOR", email: "biratnagar@drug.com", phone: "9812345682", address: "Biratnagar", city: "Biratnagar", state: "Koshi", creditLimit: 500000, outstandingBalance: 125000, assignedTo: smId, isActive: true, location: { lat: 26.4550, lng: 87.2700 }, geoFenceRadius: 200 },
      { name: "Janakpur Wholesale", type: "DISTRIBUTOR", email: "janakpur@wholesale.com", phone: "9812345683", address: "Janakpur", city: "Janakpur", state: "Madhesh", creditLimit: 400000, outstandingBalance: 95000, assignedTo: smId, isActive: true, location: { lat: 26.7288, lng: 85.9248 }, geoFenceRadius: 200 },
      { name: "Butwal Medicos", type: "RETAILER", email: "butwal@med.com", phone: "9812345684", address: "Butwal", city: "Butwal", state: "Lumbini", creditLimit: 45000, outstandingBalance: 5000, assignedTo: mrId, isActive: true, location: { lat: 27.7000, lng: 83.4500 }, geoFenceRadius: 100 },
      { name: "Nepalgunj Pharmacy", type: "RETAILER", email: "nepalgunj@pharma.com", phone: "9812345685", address: "Nepalgunj", city: "Nepalgunj", state: "Lumbini", creditLimit: 55000, outstandingBalance: 18000, assignedTo: mrId, isActive: true, location: { lat: 28.0500, lng: 81.6167 }, geoFenceRadius: 100 },
    ]);
    console.log(`Seeded ${customers.length} customers`);

    // ---- Seed Orders ----
    const orderStatuses = ["DELIVERED", "DELIVERED", "DELIVERED", "APPROVED", "DISPATCHED", "DELIVERED", "PENDING_APPROVAL", "DELIVERED", "PROCESSING", "DELIVERED"];
    const paymentStatuses = ["PAID", "PAID", "UNPAID", "PAID", "UNPAID", "PAID", "UNPAID", "PAID", "UNPAID", "PARTIAL"];
    const orders = [];
    for (let i = 1; i <= 10; i++) {
      const cust = customers[i % customers.length];
      const emp = mrId;
      const prod1 = products[Math.floor(Math.random() * products.length)];
      const prod2 = products[Math.floor(Math.random() * products.length)];
      const qty1 = Math.floor(Math.random() * 50) + 10;
      const qty2 = Math.floor(Math.random() * 30) + 5;
      const subtotal = qty1 * prod1.price + qty2 * prod2.price;
      const tax = Math.round(subtotal * 0.13);
      const total = subtotal + tax;
      const paid = paymentStatuses[i - 1] === "PAID" ? total : paymentStatuses[i - 1] === "PARTIAL" ? Math.round(total * 0.5) : 0;
      orders.push({
        orderNumber: `ORD-${String(i).padStart(4, "0")}`,
        customer: cust._id,
        employee: emp,
        orderDate: new Date(2026, 6, 20 - i),
        status: orderStatuses[i - 1],
        items: [
          { product: prod1._id, quantity: qty1, unitPrice: prod1.price, total: qty1 * prod1.price },
          { product: prod2._id, quantity: qty2, unitPrice: prod2.price, total: qty2 * prod2.price },
        ],
        subtotal, discount: 0, tax, total,
        paymentStatus: paymentStatuses[i - 1],
        paidAmount: paid,
        outstandingAmount: total - paid,
      });
    }
    await Order_.insertMany(orders);
    console.log(`Seeded ${orders.length} orders`);

    // ---- Seed Payments ----
    const paymentMethods = ["CASH", "CHEQUE", "BANK_TRANSFER", "UPI", "CARD"];
    const payments = [];
    for (let i = 1; i <= 8; i++) {
      const cust = customers[i % customers.length];
      payments.push({
      paymentNumber: `PAY-${String(i).padStart(4, "0")}`,
        receiptNumber: `RCP-${String(i).padStart(4, "0")}`,
        customer: cust._id,
        salesRep: mrId,
        amount: Math.floor(Math.random() * 50000) + 5000,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        paymentDate: new Date(2026, 6, 25 - i),
        status: i % 3 === 0 ? "PENDING" : "CONFIRMED",
        referenceNumber: `REF-${String(i).padStart(4, "0")}`,
      });
    }
    await Payment.insertMany(payments);
    console.log(`Seeded ${payments.length} payments`);

    // ---- Seed Visits ----
    const outcomes = ["SUCCESS", "SUCCESS", "PARTIAL", "SUCCESS", "NO_SALE", "SUCCESS", "SUCCESS", "PARTIAL", "SUCCESS", "CLOSED", "SUCCESS", "SUCCESS"];
    const visits = [];
    for (let i = 1; i <= 12; i++) {
      visits.push({
        visitNumber: `VIS-${String(i).padStart(4, "0")}`,
        employee: mrId,
        customer: customers[i % customers.length]._id,
        plannedDate: new Date(2026, 6, 25 - i),
        outcome: outcomes[i - 1],
        notes: `Field visit #${i} for routine check`,
        photos: [],
      });
    }
    await Visit.insertMany(visits);
    console.log(`Seeded ${visits.length} visits`);

    // ---- Seed Attendance ----
    const attStatuses = ["PRESENT", "PRESENT", "PRESENT", "ABSENT", "PRESENT", "LATE", "PRESENT", "PRESENT", "HALF_DAY", "PRESENT", "PRESENT", "ABSENT", "PRESENT", "PRESENT", "PRESENT"];
    const attUsers = [mrId, mrId, mrId, amId];
    const attendance = [];
    for (let d = 0; d < 15; d++) {
      const u = attUsers[d % attUsers.length];
      const isPresent = attStatuses[d] === "PRESENT" || attStatuses[d] === "LATE";
      const checkInTime = new Date(2026, 6, 14 + d, isPresent ? 8 : 0, Math.floor(Math.random() * 30));
      const checkOutTime = new Date(2026, 6, 14 + d, isPresent ? 17 : 0, Math.floor(Math.random() * 30));
      attendance.push({
        employee: u,
        date: new Date(2026, 6, 14 + d),
        status: attStatuses[d],
        workingHours: attStatuses[d] === "PRESENT" ? 8 : attStatuses[d] === "LATE" ? 6 : attStatuses[d] === "HALF_DAY" ? 4 : 0,
        checkIn: isPresent ? { time: checkInTime, lat: 27.7172 + (Math.random() - 0.5) * 0.01, lng: 85.324 + (Math.random() - 0.5) * 0.01, address: "Kathmandu, Nepal", type: "GPS" } : undefined,
        checkOut: isPresent ? { time: checkOutTime, lat: 27.7172 + (Math.random() - 0.5) * 0.01, lng: 85.324 + (Math.random() - 0.5) * 0.01, address: "Kathmandu, Nepal", type: "GPS" } : undefined,
      });
    }
    await Attendance.insertMany(attendance);
    console.log(`Seeded ${attendance.length} attendance records`);

    // ---- Seed Leaves ----
    const leaves = await Leave.insertMany([
      { employee: mrId, leaveType: "SICK", startDate: new Date(2026, 6, 10), endDate: new Date(2026, 6, 11), totalDays: 2, reason: "Fever and body ache", status: "APPROVED" },
      { employee: mrId, leaveType: "CASUAL", startDate: new Date(2026, 6, 20), endDate: new Date(2026, 6, 20), totalDays: 1, reason: "Personal work", status: "PENDING" },
      { employee: mrId, leaveType: "ANNUAL", startDate: new Date(2026, 7, 5), endDate: new Date(2026, 7, 9), totalDays: 5, reason: "Family vacation", status: "APPROVED" },
      { employee: amId, leaveType: "SICK", startDate: new Date(2026, 6, 15), endDate: new Date(2026, 6, 16), totalDays: 2, reason: "Medical checkup", status: "APPROVED" },
    ]);
    console.log(`Seeded ${leaves.length} leaves`);

    // ---- Seed Expenses ----
    const expTypes = ["TRAVEL", "FOOD", "FUEL", "HOTEL", "OTHER"];
    const expStatuses = ["APPROVED", "APPROVED", "PENDING", "APPROVED", "SUBMITTED", "APPROVED", "PENDING", "REIMBURSED", "APPROVED", "DRAFT"];
    const expenses = [];
    for (let i = 1; i <= 10; i++) {
      expenses.push({
        expenseNumber: `EXP-${String(i).padStart(4, "0")}`,
        employee: mrId,
        expenseType: expTypes[i % expTypes.length],
        amount: Math.floor(Math.random() * 3000) + 500,
        expenseDate: new Date(2026, 6, 20 - i),
        description: `${expTypes[i % expTypes.length]} expense for field visit #${i}`,
        status: expStatuses[i - 1],
      });
    }
    await Expense.insertMany(expenses);
    console.log(`Seeded ${expenses.length} expenses`);

    // ---- Seed Targets ----
    const targets = await Target.insertMany([
      { targetNumber: "TGT-0001", employee: mrId, period: "MONTHLY", startDate: new Date(2026, 6, 1), endDate: new Date(2026, 6, 31), overallTargetValue: 500000, overallAchievedValue: 385000, achievementPercentage: 77, status: "IN_PROGRESS", assignedBy: smId },
      { targetNumber: "TGT-0002", employee: mrId, period: "QUARTERLY", startDate: new Date(2026, 4, 1), endDate: new Date(2026, 6, 30), overallTargetValue: 1500000, overallAchievedValue: 1200000, achievementPercentage: 80, status: "ACTIVE", assignedBy: smId },
      { targetNumber: "TGT-0003", employee: mrId, period: "MONTHLY", startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 30), overallTargetValue: 450000, overallAchievedValue: 465000, achievementPercentage: 103, status: "ACHIEVED", assignedBy: smId },
    ]);
    console.log(`Seeded ${targets.length} targets`);

    // ---- Seed Stock Takes ----
    const stockTakes = [];
    for (let i = 1; i <= 5; i++) {
      stockTakes.push({
        stockTakeNumber: `STK-${String(i).padStart(4, "0")}`,
        employee: mrId,
        customer: customers[i % customers.length]._id,
        stockDate: new Date(2026, 6, 20 - i),
        type: i % 2 === 0 ? "DISTRIBUTOR" : "RETAIL",
        totalItems: Math.floor(Math.random() * 20) + 10,
        totalQuantity: Math.floor(Math.random() * 500) + 100,
        status: i === 1 ? "DRAFT" : "APPROVED",
      });
    }
    await StockTake.insertMany(stockTakes);
    console.log(`Seeded ${stockTakes.length} stock takes`);

    // ---- Seed Sales Targets ----
    await SalesTarget.insertMany([
      { targetNumber: "STG-0001", employee: mrId, targetType: "MONTHLY", periodStart: new Date(2026, 6, 1), periodEnd: new Date(2026, 6, 31), targetValue: 500000, targetUnit: "VALUE", achievedValue: 385000, achievementPercentage: 77, status: "IN_PROGRESS", assignedBy: smId, assignedAt: new Date() },
      { targetNumber: "STG-0002", employee: mrId, targetType: "VISITS", periodStart: new Date(2026, 6, 1), periodEnd: new Date(2026, 6, 31), targetValue: 25, targetUnit: "COUNT", achievedValue: 18, achievementPercentage: 72, status: "IN_PROGRESS", assignedBy: smId, assignedAt: new Date() },
    ]);
    console.log("Seeded 2 sales targets");

    // ---- Seed Gifts ----
    await Gift.insertMany([
      { giftNumber: "GFT-0001", name: "Branded Pen Set", category: "PROMOTIONAL", unitCost: 150, totalQuantity: 500, availableQuantity: 423, issuedQuantity: 77, isActive: true },
      { giftNumber: "GFT-0002", name: "Medical Diary 2026", category: "STATIONERY", unitCost: 250, totalQuantity: 300, availableQuantity: 185, issuedQuantity: 115, isActive: true },
      { giftNumber: "GFT-0003", name: "BP Monitor", category: "MEDICAL_EQUIPMENT", unitCost: 2500, totalQuantity: 50, availableQuantity: 38, issuedQuantity: 12, isActive: true },
      { giftNumber: "GFT-0004", name: "Logo Umbrella", category: "BRANDED", unitCost: 400, totalQuantity: 200, availableQuantity: 200, issuedQuantity: 0, isActive: true },
    ]);
    console.log("Seeded 4 gifts");

    // ---- Seed Samples ----
    await Sample.insertMany([
      { sampleNumber: "SMP-0001", product: products[0]._id, quantity: 100, receivedDate: new Date(2026, 6, 1), receivedBy: mrId, purpose: "DOCTOR", status: "IN_STOCK" },
      { sampleNumber: "SMP-0002", product: products[1]._id, quantity: 200, receivedDate: new Date(2026, 6, 5), receivedBy: mrId, purpose: "CHEMIST", status: "IN_STOCK" },
      { sampleNumber: "SMP-0003", product: products[3]._id, quantity: 50, receivedDate: new Date(2026, 6, 10), receivedBy: mrId, purpose: "HOSPITAL", status: "ISSUED" },
    ]);
    console.log("Seeded 3 samples");

    // ---- Seed Schemes ----
    const allCatIds = categories.map((c) => c._id);
    await Scheme.insertMany([
      { schemeNumber: "SCH-0001", name: "Summer Discount", type: "FLAT_DISCOUNT", discountType: "PERCENTAGE", discountValue: 10, applicableOn: "ALL", minQuantity: 5, startDate: new Date(2026, 5, 1), endDate: new Date(2026, 7, 31), isActive: true, customerTypes: ["RETAILER", "DISTRIBUTOR"], priority: 1 },
      { schemeNumber: "SCH-0002", name: "Antibiotic Bulk Deal", type: "VOLUME_DISCOUNT", discountType: "PERCENTAGE", discountValue: 12, applicableOn: "CATEGORY", applicableCategories: [catMap["Antibiotics"]], minQuantity: 20, startDate: new Date(2026, 6, 1), endDate: new Date(2026, 9, 30), isActive: true, customerTypes: ["RETAILER", "DISTRIBUTOR", "HOSPITAL"], priority: 2 },
      { schemeNumber: "SCH-0003", name: "New Customer 5% Off", type: "FLAT_DISCOUNT", discountType: "PERCENTAGE", discountValue: 5, applicableOn: "ALL", startDate: new Date(2026, 6, 1), endDate: new Date(2027, 6, 1), isActive: true, customerTypes: ["RETAILER"], priority: 0 },
      { schemeNumber: "SCH-0004", name: "Vitamin Flash Sale", type: "FLAT_DISCOUNT", discountType: "PERCENTAGE", discountValue: 20, applicableOn: "CATEGORY", applicableCategories: [catMap["Vitamins & Supplements"]], startDate: new Date(2026, 6, 15), endDate: new Date(2026, 7, 15), isActive: true, customerTypes: ["RETAILER", "DISTRIBUTOR"], priority: 3 },
    ]);
    console.log("Seeded 4 schemes");

    // ---- Seed Areas ----
    await Area.insertMany([
      { areaNumber: "AR-0001", name: "Kathmandu Valley", city: "Kathmandu", state: "Bagmati", territory: "Central", isActive: true },
      { areaNumber: "AR-0002", name: "Lalitpur Metro", city: "Lalitpur", state: "Bagmati", territory: "Central", isActive: true },
      { areaNumber: "AR-0003", name: "Pokhara Region", city: "Pokhara", state: "Gandaki", territory: "Western", isActive: true },
      { areaNumber: "AR-0004", name: "Chitwan District", city: "Bharatpur", state: "Bagmati", territory: "Central", isActive: true },
      { areaNumber: "AR-0005", name: "Biratnagar Zone", city: "Biratnagar", state: "Koshi", territory: "Eastern", isActive: true },
    ]);
    console.log("Seeded 5 areas");

    // ---- Seed Party Locations ----
    const partyLocations = [];
    for (const cust of customers) {
      partyLocations.push({
        customer: cust._id,
        address: cust.address,
        city: cust.city,
        state: cust.state,
        source: "MANUAL",
        isVerified: true,
      });
    }
    await PartyLocation.insertMany(partyLocations);
    console.log(`Seeded ${partyLocations.length} party locations`);

    // ---- Seed Announcements ----
    await Announcement.insertMany([
      { announcementNumber: "ANN-0001", title: "New Product Launch", content: "We are launching a new range of cardiovascular medications. All MRs are requested to attend the training session.", type: "PRODUCT_LAUNCH", priority: "HIGH", isActive: true, startDate: new Date(2026, 6, 15), sentBy: smId },
      { announcementNumber: "ANN-0002", title: "Holiday Notice: Teej", content: "Office will remain closed on the occasion of Teej festival.", type: "HOLIDAY", priority: "MEDIUM", isActive: true, startDate: new Date(2026, 7, 15), sentBy: caId },
      { announcementNumber: "ANN-0003", title: "Monthly Sales Meeting", content: "Monthly sales review meeting on 30th July at 10 AM in the conference room.", type: "NOTICE", priority: "MEDIUM", isActive: true, startDate: new Date(2026, 6, 28), sentBy: smId },
    ]);
    console.log("Seeded 3 announcements");

    // ---- Seed File Shares ----
    await FileShare.insertMany([
      { fileNumber: "FLS-0001", title: "Q2 Price List 2026", category: "PRICE_LIST", fileName: "q2-price-list-2026.pdf", fileSize: 245000, uploadedBy: caId, isActive: true },
      { fileNumber: "FLS-0002", title: "Product Catalog 2026", category: "PRODUCT_CATALOG", fileName: "product-catalog-2026.pdf", fileSize: 1800000, uploadedBy: caId, isActive: true },
      { fileNumber: "FLS-0003", title: "Training Module - New Products", category: "TRAINING", fileName: "new-product-training.pdf", fileSize: 3200000, uploadedBy: smId, isActive: true },
    ]);
    console.log("Seeded 3 file shares");

    // ---- Seed Work Logs ----
    const workLogs = [];
    for (let d = 1; d <= 10; d++) {
      workLogs.push({
        logNumber: `WLG-${String(d).padStart(4, "0")}`,
        employee: mrId,
        date: new Date(2026, 6, 11 + d),
        totalHours: 8,
        status: "APPROVED",
        remarks: `Field work completed for day ${d}. Visited ${Math.floor(Math.random() * 5) + 3} customers.`,
      });
    }
    await WorkLog.insertMany(workLogs);
    console.log(`Seeded ${workLogs.length} work logs`);

    // ---- Seed Custom Forms ----
    await CustomForm.insertMany([
      { formNumber: "FRM-0001", title: "Doctor Feedback Form", type: "DOCTOR_VISIT", isActive: true, isPublished: true },
      { formNumber: "FRM-0002", title: "Chemist Survey", type: "CHEMIST_SURVEY", isActive: true, isPublished: true },
      { formNumber: "FRM-0003", title: "Product Feedback", type: "PRODUCT_FEEDBACK", isActive: true, isPublished: false },
    ]);
    console.log("Seeded 3 custom forms");

    // ---- Seed Beat Plans ----
    await BeatPlan.insertMany([
      { beatPlanNumber: "BP-0001", employee: mrId, planDate: new Date(2026, 6, 26), type: "DAILY", area: "Kathmandu Metro", customers: customers.slice(0, 4).map((c, i) => ({ customer: c._id, sequence: i + 1, visitType: "SALES", isCompleted: false })), status: "APPROVED" },
      { beatPlanNumber: "BP-0002", employee: mrId, planDate: new Date(2026, 6, 27), type: "DAILY", area: "Lalitpur", customers: customers.slice(2, 6).map((c, i) => ({ customer: c._id, sequence: i + 1, visitType: "SALES", isCompleted: false })), status: "DRAFT" },
    ]);
    console.log("Seeded 2 beat plans");

    // ---- Seed Tour Plans ----
    await TourPlan.insertMany([
      { tourPlanNumber: "TP-0001", employee: mrId, purpose: "Regional visit to Biratnagar distributors", tourStartDate: new Date(2026, 7, 3), tourEndDate: new Date(2026, 7, 5), travelMode: "BUS", estimatedBudget: 15000, status: "APPROVED" },
      { tourPlanNumber: "TP-0002", employee: amId, purpose: "Pokhara market assessment", tourStartDate: new Date(2026, 7, 10), tourEndDate: new Date(2026, 7, 12), travelMode: "FLIGHT", estimatedBudget: 35000, status: "SUBMITTED" },
    ]);
    console.log("Seeded 2 tour plans");

    // ---- Seed Notifications ----
    await Notification.insertMany([
      { notificationNumber: "NOT-0001", title: "New Order Received", message: "Order ORD-0007 from Nepalgunj Pharmacy is pending approval.", type: "INFO", priority: "HIGH", recipientType: "ALL", channels: ["IN_APP"], status: "SENT" },
      { notificationNumber: "NOT-0002", title: "Leave Request", message: "Hari Gurung has submitted a casual leave request for July 20.", type: "INFO", priority: "MEDIUM", recipientType: "ALL", channels: ["IN_APP"], status: "SENT" },
      { notificationNumber: "NOT-0003", title: "Expense Reimbursed", message: "Your travel expense EXP-0008 of Nrs 2,847 has been reimbursed.", type: "SUCCESS", priority: "LOW", recipientType: "ALL", channels: ["IN_APP"], status: "SENT" },
      { notificationNumber: "NOT-0004", title: "Target Exceeded", message: "Monthly target TGT-0003 achieved at 103%! Great work!", type: "SUCCESS", priority: "MEDIUM", recipientType: "ALL", channels: ["IN_APP"], status: "SENT" },
      { notificationNumber: "NOT-0005", title: "System Maintenance", message: "System will be down for maintenance on Sunday 2 AM - 4 AM.", type: "WARNING", priority: "LOW", recipientType: "ALL", channels: ["IN_APP"], status: "SENT" },
    ]);
    console.log("Seeded 5 notifications");

    // ---- Seed Vans ----
    const vanDrivers = await User.find({ isActive: true }).limit(2).lean();
    const allProducts = await Product.find().lean();
    if (vanDrivers.length >= 2 && allProducts.length >= 3) {
      const prods = allProducts.slice(0, 5);
      await Van.insertMany([
        { vanNumber: "VAN-001", name: "Distribution Van 1", driver: vanDrivers[0]._id, vehicleNumber: "BA 1 JA 1234", route: "Kathmandu Valley East", status: "ACTIVE", inventory: prods.map(p => ({ product: p._id, quantity: Math.floor(Math.random() * 100) + 20 })), isActive: true },
        { vanNumber: "VAN-002", name: "Distribution Van 2", driver: vanDrivers[1]._id, vehicleNumber: "BA 1 JA 5678", route: "Kathmandu Valley West", status: "ACTIVE", inventory: prods.map(p => ({ product: p._id, quantity: Math.floor(Math.random() * 80) + 10 })), isActive: true },
      ]);
      console.log("Seeded 2 vans");
    }

    // ---- Seed Dispatches ----
    const pendingOrders = await Order_.find({ status: { $in: ["APPROVED", "PROCESSING"] } }).limit(3).lean();
    const companyAdmin = await User.findOne({ email: "companyadmin@pharma.com" }).lean();
    if (pendingOrders.length > 0 && companyAdmin) {
      const dispatches = pendingOrders.map((o, i) => ({
        dispatchNumber: `DSP-${String(i + 1).padStart(4, "0")}`,
        order: o._id,
        dispatchedBy: companyAdmin._id,
        dispatchDate: new Date(2026, 6, 20 + i),
        status: i === 0 ? "DELIVERED" : i === 1 ? "IN_TRANSIT" : "DISPATCHED",
        deliveryDate: i === 0 ? new Date(2026, 6, 22) : undefined,
        receivedBy: i === 0 ? "Customer Store" : undefined,
        items: o.items || [],
      }));
      await Dispatch.insertMany(dispatches);
      console.log(`Seeded ${dispatches.length} dispatches`);
    }

    // ---- Seed Returns ----
    const returnCustomers = await Customer.find().limit(2).lean();
    const retMrUserId = roleMap["MEDICAL_REPRESENTATIVE"];
    const retMrUser = await User.findOne({ role: retMrUserId }).lean();
    if (returnCustomers.length > 0 && retMrUser && allProducts.length > 0) {
      const rc0 = returnCustomers[0]._id;
      const rc1 = returnCustomers.length > 1 ? returnCustomers[1]._id : rc0;
      await Return.insertMany([
        { returnNumber: "RET-0001", customer: rc0, employee: retMrUser._id, returnDate: new Date(2026, 6, 25), reason: "Damaged goods in transit", status: "APPROVED", items: [{ product: allProducts[0]._id, quantity: 5, reason: "Damaged", condition: "DAMAGED" }], totalAmount: allProducts[0].price * 5, restocked: true, restockedAt: new Date(2026, 6, 26), creditNoteGenerated: true },
        { returnNumber: "RET-0002", customer: rc1, employee: retMrUser._id, returnDate: new Date(2026, 6, 27), reason: "Expired stock return", status: "PENDING", items: [{ product: allProducts[1]?._id || allProducts[0]._id, quantity: 10, reason: "Expired", condition: "EXPIRED" }], totalAmount: (allProducts[1]?.price || allProducts[0].price) * 10, restocked: false },
        { returnNumber: "RET-0003", customer: rc0, employee: retMrUser._id, returnDate: new Date(2026, 6, 28), reason: "Wrong product delivered", status: "RESTOCKED", items: [{ product: allProducts[2]?._id || allProducts[0]._id, quantity: 3, reason: "Wrong product", condition: "GOOD" }], totalAmount: (allProducts[2]?.price || allProducts[0].price) * 3, restocked: true, restockedAt: new Date(2026, 6, 29), creditNoteGenerated: true },
      ]);
      console.log("Seeded 3 returns");
    }

    console.log("\n===== SEEDING COMPLETE =====");
    console.log("All entities populated with dummy data successfully!\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
