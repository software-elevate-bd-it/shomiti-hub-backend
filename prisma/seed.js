const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // 🔹 1. SUPER ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@admin.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "super@admin.com",
      password,
      role: "super_admin",
      status: "active",
      roleIds: []
    }
  });

  // 🔹 2. SOMITEE
  const somitee = await prisma.somitee.create({
    data: {
      name: "Somitee HQ Demo",
      email: "demo@somitee.dev",
      phone: "+8801234567890",
      status: "active",
      plan: "basic",
      createdById: superAdmin.id
    }
  });

  // 🔹 3. MAIN ADMIN USER
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@somitee.dev" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@somitee.dev",
      password,
      role: "main_user",
      phone: "+8801234567890",
      somiteeId: somitee.id,
      createdById: superAdmin.id
    }
  });

  // 🔹 4. COMPANY SETTINGS
  await prisma.companySettings.create({
    data: {
      somiteeId: somitee.id,
      name: "Somitee HQ Demo",
      logo: "https://via.placeholder.com/150",
      signature: "Authorized Signature",
      address: "Dhaka, Bangladesh",
      phone: "+8801234567890",
      email: "info@somitee.dev"
    }
  });

  // 🔹 5. MEMBER
  const member = await prisma.member.create({
    data: {
      name: "John Doe",
      shopName: "John Store",
      phone: "+8801987654321",
      address: "Dhaka",
      nid: "1234567890",
      monthlyFee: 500,
      billingCycle: "monthly",
      totalPaid: 500,
      totalDue: 0,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 6. PAYMENT
  const payment = await prisma.payment.create({
    data: {
      memberId: member.id,
      amount: 500,
      paymentDate: new Date(),
      method: "cash",
      status: "completed",
      category: "monthly fee",
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 7. PAYMENT ITEM
  await prisma.paymentItem.create({
    data: {
      paymentId: payment.id,
      memberId: member.id,
      month: 4,
      financialYear: "2026",
      amount: 500,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 8. TRANSACTION (Collection)
  await prisma.transaction.create({
    data: {
      memberId: member.id,
      memberName: member.name,
      type: "collection",
      amount: 500,
      date: new Date(),
      status: "approved",
      method: "cash",
      category: "monthly fee",
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 9. EXPENSE
  await prisma.expense.create({
    data: {
      amount: 120,
      date: new Date(),
      category: "Office Supply",
      method: "cash",
      note: "Printer ink",
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 10. BANK ACCOUNT
  const bank = await prisma.bankAccount.create({
    data: {
      bankName: "Demo Bank",
      accountName: "Somitee Account",
      accountNumber: "123456789",
      balance: 10000,
      openingBalance: 10000,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 11. BANK TRANSACTION
  await prisma.bankTransaction.create({
    data: {
      bankAccountId: bank.id,
      type: "deposit",
      amount: 1000,
      date: new Date(),
      balanceAfter: 11000,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 12. CASH BOOK ENTRY
  await prisma.cashBookEntry.create({
    data: {
      date: new Date(),
      description: "Member payment",
      cashIn: 500,
      cashOut: 0,
      balance: 500,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 13. LEDGER ENTRY
  await prisma.ledgerEntry.create({
    data: {
      date: new Date(),
      description: "Monthly fee collected",
      type: "credit",
      credit: 500,
      balance: 500,
      memberId: member.id,
      memberName: member.name,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 14. STATS SUMMARY
  await prisma.statsSummary.create({
    data: {
      date: new Date(),
      totalCollection: 500,
      totalExpense: 120,
      totalDue: 0,
      somiteeId: somitee.id,
      createdById: adminUser.id
    }
  });

  // 🔹 15. SMS CONFIG
  await prisma.smsConfig.create({
    data: {
      provider: "twilio",
      apiKey: "abc123",
      senderId: "SOMITEE",
      autoSendOnPayment: true,
      createdById: adminUser.id
    }
  });

  // 🔹 16. SMS TEMPLATE
  await prisma.smsTemplate.create({
    data: {
      name: "Payment Confirmation",
      body: "Dear {{name}}, your payment of {{amount}} is received.",
      variables: ["name", "amount"],
      type: "payment",
      somiteeId: somitee.id
    }
  });

  // 🔹 17. NOTIFICATION
  await prisma.notification.create({
    data: {
      type: "info",
      title: "Welcome",
      message: "Your system is ready",
      somiteeId: somitee.id
    }
  });

  // 🔹 18. FAQ
  await prisma.faq.create({
    data: {
      question: "How to add member?",
      answer: "Go to member section and click add.",
      category: "General"
    }
  });

  console.log("✅ FULL SEED SUCCESS");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });