import prisma from '../config/prisma';

async function resetToCleanSlate() {
  console.log('====================================================');
  console.log('🧹 HOUSE OF DREAMS: RESETTING TO CLEAN SLATE');
  console.log('Removing all present rooms, hotels, and stay data...');
  console.log('Admin account will be preserved for original setup.');
  console.log('====================================================\n');

  try {
    // 1. Delete reviews
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`✓ Deleted ${deletedReviews.count} reviews`);

    // 2. Delete invoices
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`✓ Deleted ${deletedInvoices.count} invoices`);

    // 3. Delete payments
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✓ Deleted ${deletedPayments.count} payments`);

    // 4. Delete extra charges
    const deletedCharges = await prisma.extraCharge.deleteMany({});
    console.log(`✓ Deleted ${deletedCharges.count} extra charges`);

    // 5. Delete booking guests
    const deletedGuests = await prisma.bookingGuest.deleteMany({});
    console.log(`✓ Deleted ${deletedGuests.count} booking guests`);

    // 6. Delete bookings
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`✓ Deleted ${deletedBookings.count} bookings`);

    // 7. Delete room amenities
    const deletedRoomAmenities = await prisma.roomAmenity.deleteMany({});
    console.log(`✓ Deleted ${deletedRoomAmenities.count} room amenity links`);

    // 8. Delete all rooms
    const deletedRooms = await prisma.room.deleteMany({});
    console.log(`✓ Deleted ${deletedRooms.count} rooms`);

    // 9. Delete coupons linked to old branches
    const deletedCoupons = await prisma.coupon.deleteMany({});
    console.log(`✓ Deleted ${deletedCoupons.count} coupons`);

    // 10. Clear branch references on audit logs
    const updatedAudit = await prisma.auditLog.updateMany({
      where: { branchId: { not: null } },
      data: { branchId: null },
    });
    console.log(`✓ Cleared branch references on ${updatedAudit.count} audit logs`);

    // 11. Delete demo reception staff (since their branches are deleted; Admin will re-add them)
    const deletedStaff = await prisma.user.deleteMany({
      where: { role: 'RECEPTION' },
    });
    console.log(`✓ Removed ${deletedStaff.count} sample reception staff`);

    // 12. Delete all branches (hotels)
    const deletedBranches = await prisma.branch.deleteMany({});
    console.log(`✓ Deleted ${deletedBranches.count} hotel branches`);

    // 13. Verify Admin account exists
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (admin) {
      console.log(`\n👑 Admin Account Preserved:`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name:  ${admin.name}`);
    } else {
      console.log('\n⚠️ No admin found! Please seed or create admin.');
    }

    // 14. Report current database status
    const remainingBranches = await prisma.branch.count();
    const remainingRooms = await prisma.room.count();
    const remainingBookings = await prisma.booking.count();
    const remainingPayments = await prisma.payment.count();

    console.log('\n====================================================');
    console.log('🎉 CLEAN SLATE READY FOR ADMIN CONFIGURATION!');
    console.log(`   Total Branches: ${remainingBranches}`);
    console.log(`   Total Rooms:    ${remainingRooms}`);
    console.log(`   Total Bookings: ${remainingBookings}`);
    console.log(`   Total Payments: ${remainingPayments}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetToCleanSlate();
