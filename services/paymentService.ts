import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import MeterReading from '@/models/MeterReading';
import WaterBillEntry from '@/models/WaterBillEntry';
import Tenant from '@/models/Tenant';
import Room from '@/models/Room';
import Settings from '@/models/Settings';

/**
 * Generate a full monthly bill for a tenant.
 * BLOCKS if the room has hasWaterBill=true but no WaterBillEntry for this month.
 */
export async function generateBill(
  houseLordId: string,
  tenantId: string,
  month: number,
  year: number
) {
  await connectDB();

  // Fetch tenant and their room
  const tenant = await Tenant.findOne({ _id: tenantId, houseLordId }).populate('roomId');
  if (!tenant) throw new Error('Tenant not found');

  const room = await Room.findById(tenant.roomId);
  if (!room) throw new Error('Room not found');

  // ── WATER BILL GATE ────────────────────────────────────────────────────────
  let waterBill = 0;
  if (room.hasWaterBill) {
    const waterEntry = await WaterBillEntry.findOne({
      houseLordId,
      roomId: room._id,
      month,
      year,
    });
    if (!waterEntry) {
      throw new Error(
        `Water bill for Room ${room.roomNumber} (${month}/${year}) has not been set. Please set it before generating the bill.`
      );
    }
    waterBill = waterEntry.amount;
  }

  // ── ELECTRICITY ────────────────────────────────────────────────────────────
  const meterReading = await MeterReading.findOne({ houseLordId, tenantId, month, year });
  const electricityBill = meterReading?.electricityBill ?? 0;

  // ── PREVIOUS DUE ───────────────────────────────────────────────────────────
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }
  const lastPayment = await Payment.findOne({ houseLordId, tenantId, month: prevMonth, year: prevYear });
  const previousDue = lastPayment?.due ?? 0;

  // ── TOTAL ──────────────────────────────────────────────────────────────────
  const totalBill = tenant.monthlyRent + electricityBill + waterBill + previousDue;

  // Upsert — don't create a duplicate if already exists
  const existing = await Payment.findOne({ houseLordId, tenantId, month, year });
  if (existing) {
    existing.rent = tenant.monthlyRent;
    existing.electricityBill = electricityBill;
    existing.waterBill = waterBill;
    existing.previousDue = previousDue;
    existing.totalBill = totalBill;
    existing.due = totalBill - existing.amountPaid;
    existing.status = existing.amountPaid >= totalBill ? 'paid' : existing.amountPaid > 0 ? 'partial' : 'unpaid';
    return existing.save();
  }

  return Payment.create({
    houseLordId,
    tenantId,
    month,
    year,
    rent: tenant.monthlyRent,
    electricityBill,
    waterBill,
    previousDue,
    totalBill,
    amountPaid: 0,
    due: totalBill,
    status: 'unpaid',
  });
}

/** Record a payment against an existing bill */
export async function recordPayment(houseLordId: string, paymentId: string, amountPaid: number) {
  await connectDB();
  const payment = await Payment.findOne({ _id: paymentId, houseLordId });
  if (!payment) throw new Error('Payment record not found');

  payment.amountPaid = amountPaid;
  payment.due = Math.max(0, payment.totalBill - amountPaid);
  payment.status = amountPaid >= payment.totalBill ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';
  if (payment.status === 'paid') payment.paidAt = new Date();
  return payment.save();
}

export async function listPayments(houseLordId: string, month?: number, year?: number) {
  await connectDB();
  const filter: Record<string, unknown> = { houseLordId };
  if (month) filter.month = month;
  if (year) filter.year = year;
  return Payment.find(filter).populate({ path: 'tenantId', populate: { path: 'roomId' } }).lean();
}

export async function getPayment(houseLordId: string, id: string) {
  await connectDB();
  return Payment.findOne({ _id: id, houseLordId }).populate({ path: 'tenantId', populate: { path: 'roomId' } }).lean();
}

export async function deletePayment(houseLordId: string, id: string) {
  await connectDB();
  return Payment.findOneAndDelete({ _id: id, houseLordId });
}
