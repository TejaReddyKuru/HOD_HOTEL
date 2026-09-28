export type UserRole = 'ADMIN' | 'RECEPTION' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type BranchStatus = 'ACTIVE' | 'INACTIVE';
export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'OTHER';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  branchId?: string | null;
  branch?: Branch | null;
  status: UserStatus;
  address?: string | null;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  mapsUrl?: string | null;
  checkInTime: string;
  checkOutTime: string;
  featuredImage?: string | null;
  images: string; // JSON string
  status: BranchStatus;
  createdAt: string;
  _count?: {
    rooms: number;
    bookings: number;
    reviews: number;
  };
}

export interface RoomType {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  bedType: string;
  amenities: string; // JSON string
  images: string; // JSON string
  status: string;
  _count?: {
    rooms: number;
  };
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  category: string;
  status: string;
}

export interface RoomAmenity {
  id: string;
  roomId: string;
  amenityId: string;
  amenity: Amenity;
}

export interface Room {
  id: string;
  branchId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  description?: string | null;
  images: string; // JSON string
  status: RoomStatus;
  createdAt: string;
  branch?: Branch;
  roomType?: RoomType;
  roomAmenities?: RoomAmenity[];
  bookings?: {
    id: string;
    bookingNumber: string;
    status: BookingStatus;
    customer: { name: string; phone?: string | null };
    checkInDate: string;
    checkOutDate: string;
  }[];
}

export interface BookingGuest {
  id: string;
  bookingId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  isPrimary: boolean;
}

export interface ExtraCharge {
  id: string;
  bookingId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  addedBy?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  bookingId: string;
  branchId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: string;
  collectedById: string;
  notes?: string | null;
  createdAt: string;
  branch?: { id: string; name: string; city: string };
  collectedBy?: { id: string; name: string; email: string };
  booking?: {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    customer: { id: string; name: string; email: string; phone?: string | null };
    room: { roomNumber: string };
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  branchId: string;
  customerId: string;
  roomCharges: number;
  extraCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  issuedDate: string;
  notes?: string | null;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  branchId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  roomCharges: number;
  extraCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  couponCode?: string | null;
  specialRequests?: string | null;
  actualCheckIn?: string | null;
  actualCheckOut?: string | null;
  checkedInById?: string | null;
  notes?: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  };
  branch: Branch;
  room: Room;
  guests?: BookingGuest[];
  charges?: ExtraCharge[];
  payments?: Payment[];
  invoices?: Invoice[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  branchId?: string | null;
  branch?: { id: string; name: string; city: string } | null;
  usageLimit: number;
  usedCount: number;
  status: string;
}

export interface Review {
  id: string;
  customerId: string;
  branchId: string;
  roomId?: string | null;
  rating: number;
  comment: string;
  isHidden: boolean;
  createdAt: string;
  customer: { name: string; email?: string };
  branch: { id: string; name: string; city: string };
  room?: { roomNumber: string } | null;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  role: string;
  action: string;
  entity: string;
  entityId?: string | null;
  branchId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

export interface DashboardStats {
  cards: {
    totalBranches: number;
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    cleaningRooms: number;
    occupancyRate: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    todayBookings: number;
    todayRevenue: number;
    monthlyRevenue: number;
    outstandingPayments: number;
  };
  methodBreakdown: Record<string, number>;
  statusCounts: {
    confirmed: number;
    checkedIn: number;
    checkedOut: number;
    cancelled: number;
    noShow: number;
  };
  sevenDayTrend: { date: string; revenue: number }[];
  branchOccupancy: {
    id: string;
    name: string;
    city: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  }[];
}
