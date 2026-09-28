import React, { useRef } from 'react';
import { Booking } from '../../types';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, isOpen, onClose }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = booking.invoices && booking.invoices.length > 0
    ? booking.invoices[0].invoiceNumber
    : `INV-${booking.bookingNumber.replace('HOD-', '')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-[#242321] rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-[#242321] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-semibold text-lg text-[#B79A65]">House of Dreams</span>
            <span className="text-xs text-gray-400">| Tax Invoice & Folio</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#B79A65] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-[#9F824F] transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printAreaRef} className="printable-invoice p-8 sm:p-12 space-y-8 bg-white">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-widest text-[#242321]">
                HOUSE OF DREAMS
              </h1>
              <p className="text-xs uppercase tracking-[0.25em] text-[#B79A65] font-semibold mt-0.5">
                Stay. Relax. Dream.
              </p>
              <div className="text-xs text-gray-600 mt-3 space-y-0.5">
                <p className="font-semibold text-gray-800">{booking.branch?.name}</p>
                <p>{booking.branch?.address}</p>
                <p>{booking.branch?.city}, {booking.branch?.state} - {booking.branch?.pincode}</p>
                <p>Phone: {booking.branch?.phone} | Email: {booking.branch?.email}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-[#F8F5EF] border border-[#EFE8DC] text-[#5A4636] font-mono text-xs uppercase tracking-wider font-semibold rounded">
                TAX INVOICE
              </span>
              <div className="mt-2 text-xs space-y-1">
                <p><span className="text-gray-500">Invoice No:</span> <strong className="font-mono">{invoiceNumber}</strong></p>
                <p><span className="text-gray-500">Booking Ref:</span> <strong className="font-mono text-[#B79A65]">{booking.bookingNumber}</strong></p>
                <p><span className="text-gray-500">Issued Date:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p><span className="text-gray-500">Payment Status:</span> <strong className={booking.paymentStatus === 'PAID' ? 'text-green-700' : 'text-amber-700'}>{booking.paymentStatus}</strong></p>
              </div>
            </div>
          </div>

          {/* Guest & Stay Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F8F5EF] p-4 rounded-md text-xs">
            <div>
              <p className="font-semibold text-gray-500 uppercase tracking-wider mb-1">Guest Details</p>
              <p className="font-bold text-sm text-[#242321]">{booking.customer?.name}</p>
              <p className="text-gray-600">{booking.customer?.email}</p>
              <p className="text-gray-600">{booking.customer?.phone || 'Desk Verified'}</p>
              {booking.customer?.address && <p className="text-gray-600">{booking.customer.address}</p>}
            </div>

            <div className="sm:text-right">
              <p className="font-semibold text-gray-500 uppercase tracking-wider mb-1">Stay Details</p>
              <p><span className="text-gray-600">Room:</span> <strong>Room {booking.room?.roomNumber} ({booking.room?.roomType?.name || 'Deluxe'})</strong></p>
              <p><span className="text-gray-600">Check-in:</span> {new Date(booking.checkInDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              <p><span className="text-gray-600">Check-out:</span> {new Date(booking.checkOutDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              <p><span className="text-gray-600">Duration:</span> {booking.numberOfNights} Night{booking.numberOfNights > 1 ? 's' : ''} ({booking.numberOfGuests} Guests)</p>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500 uppercase tracking-wider text-left">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty / Nights</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 font-medium">
                    Room Accommodation - {booking.room?.roomType?.name || 'Deluxe Room'} (Room {booking.room?.roomNumber})
                  </td>
                  <td className="py-3 text-center">{booking.numberOfNights} Nights</td>
                  <td className="py-3 text-right">₹{booking.room?.pricePerNight.toLocaleString()}</td>
                  <td className="py-3 text-right font-medium">₹{booking.roomCharges.toLocaleString()}</td>
                </tr>

                {booking.charges && booking.charges.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 text-gray-700">
                      Extra Service: {c.description}
                    </td>
                    <td className="py-2.5 text-center">{c.quantity}</td>
                    <td className="py-2.5 text-right">₹{c.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-medium">₹{c.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Room Charges:</span>
                <span>₹{booking.roomCharges.toLocaleString()}</span>
              </div>
              {booking.extraCharges > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Extra Services:</span>
                  <span>₹{booking.extraCharges.toLocaleString()}</span>
                </div>
              )}
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Special Discount:</span>
                  <span>- ₹{booking.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST Tax (12%):</span>
                <span>₹{booking.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#242321] pt-2 border-t border-gray-300">
                <span>Grand Total:</span>
                <span>₹{booking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Paid at Desk:</span>
                <span>₹{booking.paidAmount.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between font-bold text-sm pt-1 ${booking.balanceAmount > 0 ? 'text-amber-800' : 'text-gray-700'}`}>
                <span>Balance Due:</span>
                <span>₹{booking.balanceAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Desk Payment Ledger History */}
          {booking.payments && booking.payments.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Desk Payment Records
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs space-y-2">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row justify-between text-gray-700 pb-1.5 border-b border-gray-200 last:border-none last:pb-0">
                    <div>
                      <span className="font-mono font-medium">{p.paymentNumber}</span> • <span className="font-semibold text-gray-900">{p.paymentMethod}</span>
                      {p.notes && <span className="text-gray-500 block text-[11px]">{p.notes}</span>}
                    </div>
                    <div className="text-left sm:text-right mt-1 sm:mt-0">
                      <span className="font-bold text-emerald-700">₹{p.amount.toLocaleString()}</span>
                      <span className="text-gray-400 block text-[10px]">
                        Recorded by {p.collectedBy?.name || 'Reception Staff'} on {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Note & Signature */}
          <div className="pt-6 border-t border-gray-200 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#B79A65]" />
              <div>
                <p className="font-medium text-gray-700">Physical Desk Payment Receipt</p>
                <p className="text-[11px]">Thank you for staying at House of Dreams. We wish you peaceful journeys ahead.</p>
              </div>
            </div>

            <div className="text-center sm:text-right font-serif italic text-gray-600">
              "More Than Just a Stay."
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
