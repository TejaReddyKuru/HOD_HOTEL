import { z } from 'zod';
import { PaymentMethod, RoomStatus, BookingStatus, DiscountType } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const branchSchema = z.object({
  name: z.string().min(3, 'Branch name is required'),
  description: z.string().min(10, 'Description is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string().min(4, 'Pincode is required'),
  phone: z.string().min(8, 'Phone is required'),
  email: z.string().email('Valid email required'),
  mapsUrl: z.string().optional().nullable(),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('11:00'),
  images: z.array(z.string()).optional(),
  featuredImage: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const roomTypeSchema = z.object({
  name: z.string().min(3, 'Room type name is required'),
  description: z.string().min(10, 'Description is required'),
  basePrice: z.number().positive('Base price must be positive'),
  maxOccupancy: z.number().int().positive('Max occupancy must be positive'),
  bedType: z.string().min(2, 'Bed type is required'),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  status: z.string().default('ACTIVE'),
});

export const roomSchema = z.object({
  branchId: z.string().uuid('Valid branch ID required'),
  roomTypeId: z.string().uuid('Valid room type ID required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.number().int().min(0, 'Floor must be a valid number'),
  capacity: z.number().int().positive('Capacity must be positive'),
  pricePerNight: z.number().positive('Price per night must be positive'),
  description: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  status: z.nativeEnum(RoomStatus).default(RoomStatus.AVAILABLE),
});

export const roomStatusSchema = z.object({
  status: z.nativeEnum(RoomStatus),
});

export const amenitySchema = z.object({
  name: z.string().min(2, 'Amenity name required'),
  icon: z.string().min(1, 'Icon name required'),
  description: z.string().optional().nullable(),
  category: z.string().default('GENERAL'),
  status: z.string().default('ACTIVE'),
});

export const createBookingSchema = z.object({
  branchId: z.string().uuid('Branch is required'),
  roomId: z.string().uuid('Room is required'),
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid check-in date required'),
  checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid check-out date required'),
  numberOfGuests: z.number().int().positive('Number of guests must be positive'),
  specialRequests: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  guestName: z.string().min(2, 'Primary guest name is required'),
  guestEmail: z.string().email('Valid guest email required').optional().nullable(),
  guestPhone: z.string().min(10, 'Valid 10-digit phone required').optional().nullable(),
  idType: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
});

export const walkInBookingSchema = z.object({
  branchId: z.string().uuid('Branch is required'),
  roomId: z.string().uuid('Room is required'),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  numberOfGuests: z.number().int().positive(),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().min(10, 'Phone is required'),
  idType: z.string().min(2, 'ID type is required'),
  idNumber: z.string().min(2, 'ID number is required'),
  specialRequests: z.string().optional().nullable(),
  advancePaymentAmount: z.number().min(0).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  paymentNotes: z.string().optional(),
});

export const extraChargeSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const deskPaymentSchema = z.object({
  bookingId: z.string().uuid('Valid booking ID required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional().nullable(),
});

export const receptionCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branchId: z.string().uuid('Assigned branch is required'),
});

export const receptionUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6).optional(),
  branchId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  description: z.string().min(5, 'Description is required'),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive('Discount value must be positive'),
  minBookingAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  branchId: z.string().uuid().optional().nullable(),
  usageLimit: z.number().int().positive().default(100),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).default('ACTIVE'),
});

export const reviewSchema = z.object({
  branchId: z.string().uuid(),
  roomId: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Comment must be at least 5 characters'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().optional().nullable(),
});
