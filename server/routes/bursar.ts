import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const bursarRouter = Router();

// GET /api/bursar/invoices - List fee invoices
bursarRouter.get('/invoices', (req: AuthenticatedRequest, res) => {
  const { studentId, status } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const schoolId = req.user?.schoolId;

  let tenantInvoices = db.invoices.filter((i) => i.schoolId === schoolId);

  if (studentId) {
    tenantInvoices = tenantInvoices.filter((i) => i.studentId === studentId);
  }
  if (status) {
    tenantInvoices = tenantInvoices.filter((i) => i.status === status);
  }

  // Parent / Student restrictions
  if (userRole === 'student') {
    tenantInvoices = tenantInvoices.filter((i) => i.studentId === userId);
  } else if (userRole === 'parent') {
    const childIds = db.parentStudentMaps
      .filter((psm) => psm.parentId === userId)
      .map((psm) => psm.studentId);
    tenantInvoices = tenantInvoices.filter((i) => childIds.includes(i.studentId));
  }

  return res.json({ invoices: tenantInvoices });
});

// GET /api/bursar/payments - Transaction ledger
bursarRouter.get('/payments', (req: AuthenticatedRequest, res) => {
  const schoolId = req.user?.schoolId;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  let tenantPayments = db.payments.filter((p) => p.schoolId === schoolId);

  if (userRole === 'student') {
    tenantPayments = tenantPayments.filter((p) => p.studentId === userId);
  } else if (userRole === 'parent') {
    const childIds = db.parentStudentMaps
      .filter((psm) => psm.parentId === userId)
      .map((psm) => psm.studentId);
    tenantPayments = tenantPayments.filter((p) => childIds.includes(p.studentId));
  }

  return res.json({ payments: tenantPayments });
});

// POST /api/bursar/momo-checkout - Initiate MTN MoMo or Orange Money fee payment
bursarRouter.post('/momo-checkout', (req: AuthenticatedRequest, res) => {
  const { invoiceId, phoneNumber, paymentMethod, amount, currency } = req.body;

  if (!invoiceId || !phoneNumber || !paymentMethod || !amount) {
    return res.status(400).json({ error: 'Missing parameters (invoiceId, phoneNumber, paymentMethod, amount).' });
  }

  const invoice = db.invoices.find((i) => i.id === invoiceId);
  if (!invoice || invoice.schoolId !== req.user?.schoolId) {
    return res.status(404).json({ error: 'Invoice not found in school tenant.' });
  }

  const numericAmount = Number(amount);
  const amountUSD = currency === 'USD' ? numericAmount : Math.round(numericAmount / 190);
  const amountLRD = currency === 'LRD' ? numericAmount : numericAmount * 190;

  // Generate Mobile Money Reference & Receipt
  const prefix = paymentMethod === 'mtn_momo' ? 'MTN-LR' : 'OM-LR';
  const refCode = `${prefix}-${Math.floor(100000000 + Math.random() * 900000000)}`;
  const receiptNum = `REC-2025-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPayment = {
    id: `pay-${Date.now()}`,
    invoiceId,
    schoolId: invoice.schoolId,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    amountUSD,
    amountLRD,
    currencyPaid: (currency as any) || 'USD',
    paymentMethod,
    referenceNumber: refCode,
    phoneNumber,
    status: 'completed' as const,
    receiptNumber: receiptNum,
    collectedBy: paymentMethod === 'mtn_momo' ? 'MTN MoMo Gateway' : 'Orange Money API',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.payments.unshift(newPayment);

  // Update Invoice balance
  invoice.paidUSD += amountUSD;
  invoice.paidLRD += amountLRD;
  invoice.balanceUSD = Math.max(0, invoice.totalUSD - invoice.paidUSD);
  invoice.balanceLRD = Math.max(0, invoice.totalLRD - invoice.paidLRD);
  invoice.status = invoice.balanceUSD === 0 ? 'paid' : 'partial';

  return res.status(201).json({
    success: true,
    message: `Payment of ${currency} ${amount} received via ${paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Orange Money'}.`,
    payment: newPayment,
    updatedInvoice: invoice,
  });
});
