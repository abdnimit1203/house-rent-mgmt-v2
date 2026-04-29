import { connectDB } from '@/lib/db';
import Tenant from '@/models/Tenant';
import Payment from '@/models/Payment';

export async function getDashboardStats(houseLordId: string, month: number, year: number) {
  await connectDB();

  const tenants = await Tenant.find({ houseLordId, isActive: true }).populate('roomId').lean();
  const payments = await Payment.find({ houseLordId, month, year }).lean();

  const paymentMap = new Map(payments.map((p) => [p.tenantId.toString(), p]));

  let totalBillAmount = 0;
  let totalCollected = 0;
  let totalDue = 0;
  let paidTenants = 0;
  let unpaidTenants = 0;
  let partialTenants = 0;

  const tenantSummaries = tenants.map((tenant) => {
    const payment = paymentMap.get(tenant._id.toString());

    if (payment) {
      totalBillAmount += payment.totalBill;
      totalCollected += payment.amountPaid;
      totalDue += payment.due;

      if (payment.status === 'paid') paidTenants++;
      else if (payment.status === 'partial') partialTenants++;
      else unpaidTenants++;
    } else {
      unpaidTenants++;
    }

    return {
      tenant,
      payment: payment ?? null,
      status: payment ? payment.status : 'no-bill',
    };
  });

  return {
    totalTenants: tenants.length,
    paidTenants,
    unpaidTenants,
    partialTenants,
    totalBillAmount,
    totalCollected,
    totalDue,
    tenantSummaries,
  };
}
