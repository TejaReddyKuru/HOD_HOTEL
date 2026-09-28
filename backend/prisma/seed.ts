import { PrismaClient, UserRole, UserStatus, BranchStatus, RoomStatus, BookingStatus, PaymentStatus, PaymentMethod, DiscountType, CouponStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting House of Dreams database seed...');

  // 1. Clean existing data in reverse dependency order
  console.log('🧹 Cleaning previous data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.extraCharge.deleteMany();
  await prisma.bookingGuest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.hotelSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // Common password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const receptionPasswordHash = await bcrypt.hash('reception123', salt);
  const customerPasswordHash = await bcrypt.hash('customer123', salt);

  // 2. Hotel Settings
  console.log('⚙️ Creating hotel settings...');
  await prisma.hotelSetting.createMany({
    data: [
      { key: 'hotel_name', value: 'House of Dreams', description: 'Brand name' },
      { key: 'hotel_tagline', value: 'Stay. Relax. Dream.', description: 'Brand tagline' },
      { key: 'hotel_philosophy', value: 'More Than Just a Stay.', description: 'Brand philosophy' },
      { key: 'contact_phone', value: '+91 1800 200 4663', description: 'Central toll-free helpline' },
      { key: 'contact_email', value: 'concierge@houseofdreams.com', description: 'Central inquiries email' },
      { key: 'default_checkin_time', value: '14:00', description: 'Standard check-in time' },
      { key: 'default_checkout_time', value: '11:00', description: 'Standard check-out time' },
      { key: 'tax_rate_percentage', value: '12', description: 'Goods & Services Tax rate %' },
      { key: 'cancellation_policy', value: 'Free cancellation up to 48 hours prior to check-in. Cancellations within 48 hours may be subject to a 1-night room charge.', description: 'Standard cancellation policy' },
      { key: 'payment_policy', value: 'Desk payment only upon arrival or checkout. We accept Cash, Card, and UPI directly at the reception desk.', description: 'Payment policy' },
    ],
  });

  // 3. Branches
  console.log('🏛️ Creating branches...');
  const udaipurBranch = await prisma.branch.create({
    data: {
      name: 'House of Dreams - Udaipur Heritage Palace',
      description: 'Perched gracefully along the shimmering shores of Lake Pichola, our Udaipur sanctuary captures the regal splendour of Rajasthan. Adorned with hand-carved jharokhas, sunlit marble courtyards, and sunset panoramas that whisper timeless serenity.',
      address: '12 Lake Pichola Boulevard, Old City',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      pincode: '313001',
      phone: '+91 294 242 8800',
      email: 'udaipur@houseofdreams.com',
      mapsUrl: 'https://maps.google.com/?q=Lake+Pichola+Udaipur',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: BranchStatus.ACTIVE,
    },
  });

  const shimlaBranch = await prisma.branch.create({
    data: {
      name: 'House of Dreams - Shimla Misty Pines',
      description: 'Nestled amidst whispering cedar woodlands and crisp Himalayan heights, our Shimla retreat offers warm wooden architecture, crackling fireplaces, and breathtaking morning mist rolling over the Shivalik peaks.',
      address: 'Heights Road, Near Observatory Hill',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      country: 'India',
      pincode: '171001',
      phone: '+91 177 280 4400',
      email: 'shimla@houseofdreams.com',
      mapsUrl: 'https://maps.google.com/?q=Shimla+Observatory+Hill',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      featuredImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: BranchStatus.ACTIVE,
    },
  });

  const goaBranch = await prisma.branch.create({
    data: {
      name: 'House of Dreams - Goa Palm Serenity',
      description: 'A tranquil tropical coastal haven framed by swaying palms, golden beaches, and sunlit cabanas. Designed for unhurried afternoons, barefoot evening walks, and listening to the rhythmic murmur of the Arabian Sea.',
      address: 'Sunset Beach Road, Cavelossim',
      city: 'South Goa',
      state: 'Goa',
      country: 'India',
      pincode: '403731',
      phone: '+91 832 287 1100',
      email: 'goa@houseofdreams.com',
      mapsUrl: 'https://maps.google.com/?q=Cavelossim+Beach+Goa',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      featuredImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: BranchStatus.ACTIVE,
    },
  });

  // 4. Users (Admin, 3 Reception Staff, Customers)
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Devraj Singhania',
      email: 'admin@houseofdreams.com',
      phone: '+91 98200 00001',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      address: 'House of Dreams Corporate Headquarters, Mumbai, India',
    },
  });

  const reception1 = await prisma.user.create({
    data: {
      name: 'Kavita Rathore',
      email: 'reception1@houseofdreams.com',
      phone: '+91 98200 00011',
      passwordHash: receptionPasswordHash,
      role: UserRole.RECEPTION,
      branchId: udaipurBranch.id,
      status: UserStatus.ACTIVE,
      address: 'Old City, Udaipur, Rajasthan',
    },
  });

  const reception2 = await prisma.user.create({
    data: {
      name: 'Rohan Thakur',
      email: 'reception2@houseofdreams.com',
      phone: '+91 98200 00012',
      passwordHash: receptionPasswordHash,
      role: UserRole.RECEPTION,
      branchId: shimlaBranch.id,
      status: UserStatus.ACTIVE,
      address: 'Mall Road, Shimla, Himachal Pradesh',
    },
  });

  const reception3 = await prisma.user.create({
    data: {
      name: 'Maria D’Souza',
      email: 'reception3@houseofdreams.com',
      phone: '+91 98200 00013',
      passwordHash: receptionPasswordHash,
      role: UserRole.RECEPTION,
      branchId: goaBranch.id,
      status: UserStatus.ACTIVE,
      address: 'Cavelossim, South Goa',
    },
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Vikram Malhotra',
      email: 'customer@houseofdreams.com',
      phone: '+91 98201 12345',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      address: 'Pali Hill, Bandra West, Mumbai, MH',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98112 34567',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      address: 'Indiranagar 100ft Road, Bengaluru, KA',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 99304 56789',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      address: 'Greater Kailash Part II, New Delhi, DL',
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      phone: '+91 98450 67890',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      address: 'Salt Lake City, Sector V, Kolkata, WB',
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      name: 'Rohit Verma',
      email: 'rohit.verma@example.com',
      phone: '+91 97123 45678',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      address: 'Banjara Hills, Hyderabad, TS',
    },
  });

  // 5. Room Types
  console.log('🛏️ Creating room types...');
  const roomTypesData = [
    {
      name: 'Standard Deluxe Room',
      slug: 'standard-deluxe-room',
      description: 'An elegantly appointed haven with bespoke teakwood furniture, plush bedding, rain shower, and warm ambient lighting for quiet contemplation.',
      basePrice: 4200,
      maxOccupancy: 2,
      bedType: 'Queen Bed',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
      ]),
      amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Smart TV', 'Hot Water', 'Work Desk']),
    },
    {
      name: 'Royal Lakefront Suite',
      slug: 'royal-lakefront-suite',
      description: 'Expansive private suite with sweeping lake panoramas, handcrafted jharokha window seating, deep soaking tub, and curated art pieces.',
      basePrice: 8500,
      maxOccupancy: 3,
      bedType: 'King Bed + Daybed',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80'
      ]),
      amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Smart TV', 'Hot Water', 'Balcony', 'Mini Fridge', 'Complimentary Breakfast', 'Room Service']),
    },
    {
      name: 'Mountain Pine Chalet',
      slug: 'mountain-pine-chalet',
      description: 'Cedar-paneled mountain lodge retreat with private sit-out facing forested Himalayan ridges, cast-iron stove ambiance, and wool-down duvets.',
      basePrice: 6500,
      maxOccupancy: 3,
      bedType: 'King Bed',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'
      ]),
      amenities: JSON.stringify(['WiFi', 'Smart TV', 'Hot Water', 'Balcony', 'Work Desk', 'Complimentary Breakfast']),
    },
    {
      name: 'Coastal Garden Villa',
      slug: 'coastal-garden-villa',
      description: 'A private tropical villa enveloped by lush frangipani blossoms and palm shade. Includes an open-air rain shower, breezy veranda, and hammock.',
      basePrice: 7800,
      maxOccupancy: 4,
      bedType: 'King Bed + 2 Twin Beds',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80'
      ]),
      amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Smart TV', 'Hot Water', 'Balcony', 'Mini Fridge', 'Swimming Pool Access']),
    },
    {
      name: 'Presidential Dream Residence',
      slug: 'presidential-dream-residence',
      description: 'The pinnacle of House of Dreams luxury. Sprawling two-bedroom residence with private plunge pool, butler pantry, private dining lounge, and majestic sunset views.',
      basePrice: 15500,
      maxOccupancy: 5,
      bedType: '2 Super King Beds',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
      ]),
      amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Smart TV', 'Hot Water', 'Balcony', 'Mini Fridge', 'Complimentary Breakfast', 'Room Service', 'Valet Parking', 'Swimming Pool Access']),
    },
  ];

  const createdRoomTypes = [];
  for (const rt of roomTypesData) {
    const created = await prisma.roomType.create({ data: rt });
    createdRoomTypes.push(created);
  }

  // 6. Amenities
  console.log('✨ Creating amenities...');
  const amenitiesList = [
    { name: 'High-speed WiFi', icon: 'Wifi', description: 'Gigabit fiber connection across rooms and gardens' },
    { name: 'Air Conditioning', icon: 'Wind', description: 'Whisper-quiet climate control with air purifier' },
    { name: 'Smart TV', icon: 'Tv', description: '55" 4K UHD TV with Netflix & Prime Video' },
    { name: 'King Bed', icon: 'Bed', description: 'Custom orthopaedic mattress with 500 thread-count Egyptian cotton' },
    { name: 'Complimentary Breakfast', icon: 'Coffee', description: 'Gourmet organic breakfast served fresh each morning' },
    { name: 'Valet Parking', icon: 'Car', description: 'Complimentary secure on-site parking with EV charging' },
    { name: '24/7 In-Room Dining', icon: 'Utensils', description: 'Artisanal regional & continental dining delivered anytime' },
    { name: 'Hot Water Geyser', icon: 'Flame', description: 'Continuous solar & geyser heated pressure shower' },
    { name: 'Private Balcony', icon: 'Sun', description: 'Furnished sit-out deck with serene nature views' },
    { name: 'Executive Work Desk', icon: 'Laptop', description: 'Ergonomic wooden workstation with universal power sockets' },
    { name: 'Mini Bar & Fridge', icon: 'Wine', description: 'Chilled artisanal beverages and gourmet snacks' },
    { name: 'Swimming Pool', icon: 'Waves', description: 'Temperature-controlled infinity pool overlooking gardens' },
  ];

  const createdAmenities = [];
  for (const am of amenitiesList) {
    const created = await prisma.amenity.create({ data: am });
    createdAmenities.push(created);
  }

  // 7. Rooms (21 rooms across 3 branches)
  console.log('🚪 Creating rooms across all branches...');
  interface RoomSeedConfig {
    branchId: string;
    roomTypeId: string;
    roomNumber: string;
    floor: number;
    capacity: number;
    pricePerNight: number;
    status: RoomStatus;
    description: string;
    image: string;
  }

  const roomConfigs: RoomSeedConfig[] = [
    // Udaipur (8 rooms)
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '101', floor: 1, capacity: 2, pricePerNight: 4200, status: RoomStatus.AVAILABLE, description: 'Courtyard garden view deluxe room with traditional Rajasthani arches.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '102', floor: 1, capacity: 2, pricePerNight: 4200, status: RoomStatus.OCCUPIED, description: 'Quiet ground floor room overlooking the central fountain.', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '103', floor: 1, capacity: 2, pricePerNight: 4500, status: RoomStatus.CLEANING, description: 'Spacious deluxe room with carved rosewood furnishings.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[1].id, roomNumber: '201', floor: 2, capacity: 3, pricePerNight: 8500, status: RoomStatus.OCCUPIED, description: 'Premier lakefront suite with direct view of the City Palace lights.', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[1].id, roomNumber: '202', floor: 2, capacity: 3, pricePerNight: 8500, status: RoomStatus.AVAILABLE, description: 'Second-floor royal suite with private jharokha balcony.', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[1].id, roomNumber: '203', floor: 2, capacity: 3, pricePerNight: 8900, status: RoomStatus.RESERVED, description: 'Corner suite with panoramic double-aspect lake windows.', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[4].id, roomNumber: '301', floor: 3, capacity: 5, pricePerNight: 16000, status: RoomStatus.AVAILABLE, description: 'The Grand Mewar Presidential Penthouse Suite with terrace jacuzzi.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
    { branchId: udaipurBranch.id, roomTypeId: createdRoomTypes[4].id, roomNumber: '302', floor: 3, capacity: 5, pricePerNight: 16500, status: RoomStatus.MAINTENANCE, description: 'Heritage Presidential Suite undergoing scheduled brass polishing.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' },

    // Shimla (7 rooms)
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '101', floor: 1, capacity: 2, pricePerNight: 4000, status: RoomStatus.AVAILABLE, description: 'Cozy pine room with wooden flooring and mountain garden view.', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' },
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '102', floor: 1, capacity: 2, pricePerNight: 4000, status: RoomStatus.OCCUPIED, description: 'Deluxe pine haven facing the cedar valley.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[2].id, roomNumber: '201', floor: 2, capacity: 3, pricePerNight: 6500, status: RoomStatus.AVAILABLE, description: 'Himalayan Ridge View Chalet with private viewing deck.', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[2].id, roomNumber: '202', floor: 2, capacity: 3, pricePerNight: 6500, status: RoomStatus.RESERVED, description: 'Cedar wood chalet with heated bathroom floors and fireplace.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[2].id, roomNumber: '203', floor: 2, capacity: 3, pricePerNight: 6800, status: RoomStatus.CLEANING, description: 'Chalet room with high-pitched ceilings and sunlit reading nook.', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[4].id, roomNumber: '301', floor: 3, capacity: 5, pricePerNight: 14500, status: RoomStatus.AVAILABLE, description: 'The Viceroy Penthouse Suite with 360-degree snow peak vistas.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
    { branchId: shimlaBranch.id, roomTypeId: createdRoomTypes[4].id, roomNumber: '302', floor: 3, capacity: 5, pricePerNight: 14500, status: RoomStatus.AVAILABLE, description: 'Top-tier duplex suite with cedar attic and private observatory telescope.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' },

    // Goa (7 rooms)
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '101', floor: 1, capacity: 2, pricePerNight: 4500, status: RoomStatus.AVAILABLE, description: 'Garden cabana room surrounded by tropical hibiscus and palms.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[0].id, roomNumber: '102', floor: 1, capacity: 2, pricePerNight: 4500, status: RoomStatus.OCCUPIED, description: 'Breezy ground-floor room steps away from the pool courtyard.', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' },
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[3].id, roomNumber: '201', floor: 2, capacity: 4, pricePerNight: 7800, status: RoomStatus.AVAILABLE, description: 'Coastal villa suite with open balcony and ocean sea breeze.', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80' },
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[3].id, roomNumber: '202', floor: 2, capacity: 4, pricePerNight: 7800, status: RoomStatus.OCCUPIED, description: 'Family coastal villa with private sun deck and teak loungers.', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80' },
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[3].id, roomNumber: '203', floor: 2, capacity: 4, pricePerNight: 8200, status: RoomStatus.RESERVED, description: 'Luxury palm-canopy villa with handcrafted cane furniture.', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80' },
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[4].id, roomNumber: '301', floor: 3, capacity: 5, pricePerNight: 16000, status: RoomStatus.AVAILABLE, description: 'Arabian Sea Sunset Presidential Villa with private infinity plunge pool.', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80' },
    { branchId: goaBranch.id, roomTypeId: createdRoomTypes[4].id, roomNumber: '302', floor: 3, capacity: 5, pricePerNight: 16500, status: RoomStatus.CLEANING, description: 'Secluded luxury villa with direct private pathway to the dunes.', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  ];

  const createdRooms = [];
  for (const rc of roomConfigs) {
    const created = await prisma.room.create({
      data: {
        branchId: rc.branchId,
        roomTypeId: rc.roomTypeId,
        roomNumber: rc.roomNumber,
        floor: rc.floor,
        capacity: rc.capacity,
        pricePerNight: rc.pricePerNight,
        status: rc.status,
        description: rc.description,
        images: JSON.stringify([rc.image]),
      },
    });
    createdRooms.push(created);

    // Attach 3-4 amenities to each room
    const randomAmenities = createdAmenities.slice(0, 5);
    for (const am of randomAmenities) {
      await prisma.roomAmenity.create({
        data: {
          roomId: created.id,
          amenityId: am.id,
        },
      });
    }
  }

  // 8. Coupons / Offers
  console.log('🏷️ Creating coupons and offers...');
  const couponsData = [
    {
      code: 'WELCOME10',
      description: '10% off on your first reservation with House of Dreams',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minBookingAmount: 3000,
      maxDiscount: 2000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 500,
      usedCount: 24,
      status: CouponStatus.ACTIVE,
    },
    {
      code: 'DREAMSTAY',
      description: 'Flat ₹1,000 off on long weekend luxury getaways',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 1000,
      minBookingAmount: 7000,
      maxDiscount: 1000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 200,
      usedCount: 15,
      status: CouponStatus.ACTIVE,
    },
    {
      code: 'ROYAL20',
      description: 'Exclusive 20% privilege savings for heritage and presidential suites',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minBookingAmount: 12000,
      maxDiscount: 5000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 100,
      usedCount: 8,
      status: CouponStatus.ACTIVE,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({ data: c });
  }

  // 9. Bookings with desk payments, extra charges, and invoices
  console.log('📅 Creating realistic bookings, payments, and invoices...');

  // Helper date function
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  // Booking 1: CHECKED_IN (Udaipur Room 102 - Customer 1)
  const b1In = new Date(now.getTime() - 1 * day);
  const b1Out = new Date(now.getTime() + 2 * day);
  const b1Nights = 3;
  const b1Room = createdRooms[1]; // Udaipur Room 102 (₹4200)
  const b1RoomCharges = b1Nights * b1Room.pricePerNight; // ₹12,600
  const b1ExtraCharges = 850; // Room service
  const b1Tax = (b1RoomCharges + b1ExtraCharges) * 0.12; // ₹1,614
  const b1Total = b1RoomCharges + b1ExtraCharges + b1Tax; // ₹15,064
  const b1Paid = 8000; // Partially paid desk payment
  const b1Balance = b1Total - b1Paid;

  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: 'HOD-UDR-2026-001',
      customerId: customer1.id,
      branchId: udaipurBranch.id,
      roomId: b1Room.id,
      checkInDate: b1In,
      checkOutDate: b1Out,
      numberOfNights: b1Nights,
      numberOfGuests: 2,
      status: BookingStatus.CHECKED_IN,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      roomCharges: b1RoomCharges,
      extraCharges: b1ExtraCharges,
      taxAmount: b1Tax,
      discountAmount: 0,
      totalAmount: b1Total,
      paidAmount: b1Paid,
      balanceAmount: b1Balance,
      specialRequests: 'Quiet room with feather pillows and lake-facing morning coffee.',
      actualCheckIn: b1In,
      checkedInById: reception1.id,
      notes: 'Guest checked in at desk. Paid ₹8,000 partial payment via UPI. Balance ₹7,064 to be cleared at checkout.',
      guests: {
        create: [
          { fullName: 'Vikram Malhotra', email: 'customer@houseofdreams.com', phone: '+91 98201 12345', idType: 'Aadhaar', idNumber: '5642-8901-2345', isPrimary: true },
          { fullName: 'Simran Malhotra', email: 'simran.m@example.com', phone: '+91 98201 12346', idType: 'Aadhaar', idNumber: '5642-8901-2346', isPrimary: false },
        ],
      },
      charges: {
        create: [
          { description: 'Evening Gourmet Coffee & Saffron Halwa Room Service', quantity: 2, unitPrice: 425, totalAmount: 850, addedBy: reception1.name },
        ],
      },
      payments: {
        create: [
          {
            paymentNumber: 'PAY-UDR-001',
            branchId: udaipurBranch.id,
            amount: 8000,
            paymentMethod: PaymentMethod.UPI,
            status: 'PAID',
            collectedById: reception1.id,
            notes: 'Advance desk payment collected at check-in via UPI QR.',
          },
        ],
      },
    },
  });

  // Booking 2: CHECKED_OUT (Completed stay - Udaipur Room 201 - Customer 2)
  const b2In = new Date(now.getTime() - 4 * day);
  const b2Out = new Date(now.getTime() - 1 * day);
  const b2Nights = 3;
  const b2Room = createdRooms[3]; // Udaipur Room 201 (₹8500)
  const b2RoomCharges = b2Nights * b2Room.pricePerNight; // ₹25,500
  const b2Tax = b2RoomCharges * 0.12; // ₹3,060
  const b2Discount = 1000;
  const b2Total = b2RoomCharges + b2Tax - b2Discount; // ₹27,560
  const b2Paid = b2Total;

  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: 'HOD-UDR-2026-002',
      customerId: customer2.id,
      branchId: udaipurBranch.id,
      roomId: b2Room.id,
      checkInDate: b2In,
      checkOutDate: b2Out,
      numberOfNights: b2Nights,
      numberOfGuests: 2,
      status: BookingStatus.CHECKED_OUT,
      paymentStatus: PaymentStatus.PAID,
      roomCharges: b2RoomCharges,
      extraCharges: 0,
      taxAmount: b2Tax,
      discountAmount: b2Discount,
      totalAmount: b2Total,
      paidAmount: b2Paid,
      balanceAmount: 0,
      couponCode: 'DREAMSTAY',
      actualCheckIn: b2In,
      actualCheckOut: b2Out,
      checkedInById: reception1.id,
      notes: 'Completed wonderful stay. Fully settled at desk with Card.',
      guests: {
        create: [
          { fullName: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98112 34567', idType: 'Passport', idNumber: 'N4820193', isPrimary: true },
        ],
      },
      payments: {
        create: [
          {
            paymentNumber: 'PAY-UDR-002A',
            branchId: udaipurBranch.id,
            amount: 15000,
            paymentMethod: PaymentMethod.CARD,
            status: 'PAID',
            collectedById: reception1.id,
            notes: 'Desk payment at check-in via POS Card terminal.',
          },
          {
            paymentNumber: 'PAY-UDR-002B',
            branchId: udaipurBranch.id,
            amount: 12560,
            paymentMethod: PaymentMethod.CARD,
            status: 'PAID',
            collectedById: reception1.id,
            notes: 'Final balance settlement at checkout.',
          },
        ],
      },
    },
  });

  // Invoice for booking 2
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      bookingId: booking2.id,
      branchId: udaipurBranch.id,
      customerId: customer2.id,
      roomCharges: b2RoomCharges,
      extraCharges: 0,
      taxAmount: b2Tax,
      discountAmount: b2Discount,
      totalAmount: b2Total,
      paidAmount: b2Paid,
      balanceAmount: 0,
      issuedDate: b2Out,
      notes: 'Thank you for choosing House of Dreams Udaipur. We hope to welcome you back soon.',
    },
  });

  // Review from Customer 2 for completed stay
  await prisma.review.create({
    data: {
      customerId: customer2.id,
      branchId: udaipurBranch.id,
      roomId: b2Room.id,
      rating: 5,
      comment: 'An enchanting escape! The sunset over Lake Pichola from the jharokha was pure magic. Staff was extraordinarily gentle, thoughtful, and courteous. Truly more than just a stay.',
    },
  });

  // Booking 3: CONFIRMED Upcoming (Shimla Room 202 - Customer 3)
  const b3In = new Date(now.getTime() + 3 * day);
  const b3Out = new Date(now.getTime() + 6 * day);
  const b3Nights = 3;
  const b3Room = createdRooms[11]; // Shimla Room 202 (₹6500)
  const b3RoomCharges = b3Nights * b3Room.pricePerNight; // ₹19,500
  const b3Tax = b3RoomCharges * 0.12; // ₹2,340
  const b3Discount = b3RoomCharges * 0.10; // ₹1,950
  const b3Total = b3RoomCharges + b3Tax - b3Discount; // ₹19,890

  await prisma.booking.create({
    data: {
      bookingNumber: 'HOD-SML-2026-003',
      customerId: customer3.id,
      branchId: shimlaBranch.id,
      roomId: b3Room.id,
      checkInDate: b3In,
      checkOutDate: b3Out,
      numberOfNights: b3Nights,
      numberOfGuests: 2,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.UNPAID,
      roomCharges: b3RoomCharges,
      extraCharges: 0,
      taxAmount: b3Tax,
      discountAmount: b3Discount,
      totalAmount: b3Total,
      paidAmount: 0,
      balanceAmount: b3Total,
      couponCode: 'WELCOME10',
      specialRequests: 'Arriving by toy train in the afternoon. Please arrange warm mountain tea on arrival.',
      notes: 'Customer reserved online with Desk Payment. Full payment will be settled at reception.',
      guests: {
        create: [
          { fullName: 'Arjun Mehta', email: 'arjun.mehta@example.com', phone: '+91 99304 56789', idType: 'Aadhaar', idNumber: '9841-2311-8765', isPrimary: true },
        ],
      },
    },
  });

  // Booking 4: CHECKED_IN (Goa Room 102 - Customer 4)
  const b4In = new Date(now.getTime() - 2 * day);
  const b4Out = new Date(now.getTime() + 1 * day);
  const b4Nights = 3;
  const b4Room = createdRooms[16]; // Goa Room 102 (₹4500)
  const b4RoomCharges = b4Nights * b4Room.pricePerNight; // ₹13,500
  const b4Extra = 1200; // Laundry & Coconut drinks
  const b4Tax = (b4RoomCharges + b4Extra) * 0.12;
  const b4Total = b4RoomCharges + b4Extra + b4Tax;
  const b4Paid = 10000;

  await prisma.booking.create({
    data: {
      bookingNumber: 'HOD-GOA-2026-004',
      customerId: customer4.id,
      branchId: goaBranch.id,
      roomId: b4Room.id,
      checkInDate: b4In,
      checkOutDate: b4Out,
      numberOfNights: b4Nights,
      numberOfGuests: 2,
      status: BookingStatus.CHECKED_IN,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      roomCharges: b4RoomCharges,
      extraCharges: b4Extra,
      taxAmount: b4Tax,
      discountAmount: 0,
      totalAmount: b4Total,
      paidAmount: b4Paid,
      balanceAmount: b4Total - b4Paid,
      actualCheckIn: b4In,
      checkedInById: reception3.id,
      specialRequests: 'Ground floor room near gardens preferred.',
      charges: {
        create: [
          { description: 'Fresh Tender Coconut Refreshments & Sunset Snacks', quantity: 2, unitPrice: 350, totalAmount: 700, addedBy: reception3.name },
          { description: 'Express Coastal Laundry Service', quantity: 1, unitPrice: 500, totalAmount: 500, addedBy: reception3.name },
        ],
      },
      payments: {
        create: [
          {
            paymentNumber: 'PAY-GOA-001',
            branchId: goaBranch.id,
            amount: 10000,
            paymentMethod: PaymentMethod.CASH,
            status: 'PAID',
            collectedById: reception3.id,
            notes: 'Desk payment received in Cash at reception.',
          },
        ],
      },
      guests: {
        create: [
          { fullName: 'Ananya Sen', email: 'ananya.sen@example.com', phone: '+91 98450 67890', idType: 'Driving License', idNumber: 'WB02-20180041234', isPrimary: true },
        ],
      },
    },
  });

  // Booking 5: CHECKED_OUT (Completed stay - Shimla - Customer 5)
  const b5In = new Date(now.getTime() - 7 * day);
  const b5Out = new Date(now.getTime() - 4 * day);
  const b5Nights = 3;
  const b5Room = createdRooms[10]; // Shimla Room 201 (₹6500)
  const b5RoomCharges = b5Nights * b5Room.pricePerNight; // ₹19,500
  const b5Tax = b5RoomCharges * 0.12;
  const b5Total = b5RoomCharges + b5Tax;
  const b5Paid = b5Total;

  const booking5 = await prisma.booking.create({
    data: {
      bookingNumber: 'HOD-SML-2026-005',
      customerId: customer5.id,
      branchId: shimlaBranch.id,
      roomId: b5Room.id,
      checkInDate: b5In,
      checkOutDate: b5Out,
      numberOfNights: b5Nights,
      numberOfGuests: 2,
      status: BookingStatus.CHECKED_OUT,
      paymentStatus: PaymentStatus.PAID,
      roomCharges: b5RoomCharges,
      extraCharges: 0,
      taxAmount: b5Tax,
      discountAmount: 0,
      totalAmount: b5Total,
      paidAmount: b5Paid,
      balanceAmount: 0,
      actualCheckIn: b5In,
      actualCheckOut: b5Out,
      checkedInById: reception2.id,
      payments: {
        create: [
          {
            paymentNumber: 'PAY-SML-001',
            branchId: shimlaBranch.id,
            amount: b5Paid,
            paymentMethod: PaymentMethod.UPI,
            status: 'PAID',
            collectedById: reception2.id,
            notes: 'Settled fully at desk via UPI QR code.',
          },
        ],
      },
      guests: {
        create: [
          { fullName: 'Rohit Verma', email: 'rohit.verma@example.com', phone: '+91 97123 45678', idType: 'Aadhaar', idNumber: '3456-7890-1234', isPrimary: true },
        ],
      },
    },
  });

  // Invoice for booking 5
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0002',
      bookingId: booking5.id,
      branchId: shimlaBranch.id,
      customerId: customer5.id,
      roomCharges: b5RoomCharges,
      extraCharges: 0,
      taxAmount: b5Tax,
      discountAmount: 0,
      totalAmount: b5Total,
      paidAmount: b5Paid,
      balanceAmount: 0,
      issuedDate: b5Out,
      notes: 'Thank you for experiencing the mountain serenity at House of Dreams Shimla.',
    },
  });

  // Review from Customer 5
  await prisma.review.create({
    data: {
      customerId: customer5.id,
      branchId: shimlaBranch.id,
      roomId: b5Room.id,
      rating: 5,
      comment: 'Waking up to the morning fog over the pines was an unforgettable highlight. Cozy rooms, delicious breakfast, and seamless desk check-in. Highly recommend!',
    },
  });

  // Additional reviews
  await prisma.review.create({
    data: {
      customerId: customer1.id,
      branchId: goaBranch.id,
      rating: 5,
      comment: 'A true sanctuary. Clean sandy walkways, peaceful pool deck, and warm hospitality from the moment we walked in.',
    },
  });

  // 10. Audit Logs
  console.log('📝 Creating initial audit logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userName: adminUser.name,
        role: 'ADMIN',
        action: 'SYSTEM_INITIALIZATION',
        entity: 'System',
        entityId: 'global',
        details: 'Initial system seed and multi-branch infrastructure established.',
        ipAddress: '127.0.0.1',
      },
      {
        userName: reception1.name,
        role: 'RECEPTION',
        action: 'GUEST_CHECK_IN',
        entity: 'Booking',
        entityId: booking1.id,
        branchId: udaipurBranch.id,
        details: `Checked in guest Vikram Malhotra into room 102. Advance payment ₹8,000 recorded.`,
        ipAddress: '192.168.1.10',
      },
      {
        userName: reception1.name,
        role: 'RECEPTION',
        action: 'PAYMENT_RECORDED',
        entity: 'Payment',
        entityId: 'PAY-UDR-001',
        branchId: udaipurBranch.id,
        details: `Recorded desk payment of ₹8,000 via UPI for booking HOD-UDR-2026-001.`,
        ipAddress: '192.168.1.10',
      },
    ],
  });

  // 11. Initial Notifications
  console.log('🔔 Creating system notifications...');
  await prisma.notification.createMany({
    data: [
      {
        title: 'Welcome to House of Dreams',
        message: 'System is initialized with 3 branches, 21 luxury rooms, and desk payment workflow.',
        type: 'INFO',
        isRead: false,
      },
      {
        userId: customer1.id,
        title: 'Reservation Confirmed',
        message: 'Your stay at Udaipur Heritage Palace is active. Check-in completed.',
        type: 'BOOKING',
        isRead: false,
      },
      {
        branchId: udaipurBranch.id,
        title: 'Room Status Update',
        message: 'Room 103 is scheduled for housekeeping inspection.',
        type: 'HOUSEKEEPING',
        isRead: false,
      },
    ],
  });

  console.log('✅ House of Dreams database seeding completed successfully!');
  console.log('\n--- DEMO ACCOUNTS READY ---');
  console.log('ADMIN:      admin@houseofdreams.com      / admin123');
  console.log('RECEPTION1: reception1@houseofdreams.com / reception123 (Udaipur Heritage Palace)');
  console.log('RECEPTION2: reception2@houseofdreams.com / reception123 (Shimla Misty Pines)');
  console.log('RECEPTION3: reception3@houseofdreams.com / reception123 (Goa Palm Serenity)');
  console.log('CUSTOMER:   customer@houseofdreams.com   / customer123 (Vikram Malhotra)');
  console.log('---------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
