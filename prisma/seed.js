const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt =  require('bcrypt');


async function main() {
  const password = await bcrypt.hash("1234546", 12);
  console.log('password', password);
  

const somitee = await prisma.somitee.upsert({
  where: { id: 'sample-somitee-id' },
  update: {
    name: 'Somitee HQ Demo',
    email: 'demo@somitee.dev',
    phone: '+8801234567890',
    status: 'active',
    plan: 'basic'
  },
  create: {
    id: 'sample-somitee-id',
    name: 'Somitee HQ Demo',
    email: 'demo@somitee.dev',
    phone: '+8801234567890',
    status: 'active',
    plan: 'basic'
  }
});

const adminUser = await prisma.user.upsert({
  where: { email: 'admin@somitee.dev' },
  update: {
    name: 'Demo Admin',
    password: password, // ✅ এখানে hashed password
    role: 'main_user',
    phone: '+8801234567890',
    somiteeId: somitee.id
  },
  create: {
    id: 'sample-admin-user-id',
    name: 'Demo Admin',
    email: 'admin@somitee.dev',
    password: password, // ✅ এখানে same hashed password
    role: 'main_user',
    phone: '+8801234567890',
    somiteeId: somitee.id,
    userId: 'sample-admin-user-id'
  }
});

  await prisma.companySettings.upsert({
    where: { id: 'sample-company-settings-id' },
    update: {
      name: 'Somitee HQ Demo',
      logo: 'https://example.com/logo.png',
      signature: 'Demo Signature',
      address: '123 Demo Street, Dhaka',
      phone: '+8801234567890',
      email: 'info@somitee.dev'
    },
    create: {
      id: 'sample-company-settings-id',
      somiteeId: somitee.id,
      name: 'Somitee HQ Demo',
      logo: 'https://example.com/logo.png',
      signature: 'Demo Signature',
      address: '123 Demo Street, Dhaka',
      phone: '+8801234567890',
      email: 'info@somitee.dev'
    }
  });

  const member = await prisma.member.upsert({
    where: { id: 'sample-member-id' },
    update: {
      name: 'John Doe',
      shopName: 'John Doe Shop',
      phone: '+8801987654321',
      address: 'Dhaka, Bangladesh',
      nid: '1234567890',
      monthlyFee: 500,
      billingCycle: 'monthly',
      status: 'active'
    },
    create: {
      id: 'sample-member-id',
      name: 'John Doe',
      shopName: 'John Doe Shop',
      phone: '+8801987654321',
      address: 'Dhaka, Bangladesh',
      nid: '1234567890',
      monthlyFee: 500,
      billingCycle: 'monthly',
      totalDue: 0,
      totalPaid: 500,
      somiteeId: somitee.id,
      userId: adminUser.id
    }
  });

  await prisma.payment.upsert({
    where: { id: 'sample-payment-id' },
    update: {
      amount: 500,
      paymentDate: new Date(),
      method: 'cash',
      status: 'completed',
      category: 'monthly fee'
    },
    create: {
      id: 'sample-payment-id',
      memberId: member.id,
      amount: 500,
      paymentDate: new Date(),
      method: 'cash',
      status: 'completed',
      category: 'monthly fee',
      somiteeId: somitee.id,
      userId: adminUser.id,
      paymentItems: {
        create: [
          {
            id: 'sample-payment-item-id',
            memberId: member.id,
            month: 4,
            financialYear: '2026',
            amount: 500,
            somiteeId: somitee.id,
            userId: adminUser.id
          }
        ]
      }
    }
  });

  await prisma.expense.upsert({
    where: { id: 'sample-expense-id' },
    update: {
      amount: 120,
      date: new Date(),
      category: 'Office Supply',
      method: 'cash',
      note: 'Printer ink refill'
    },
    create: {
      id: 'sample-expense-id',
      amount: 120,
      date: new Date(),
      category: 'Office Supply',
      method: 'cash',
      note: 'Printer ink refill',
      somiteeId: somitee.id,
      userId: adminUser.id
    }
  });

  await prisma.bankAccount.upsert({
    where: { id: 'sample-bank-account-id' },
    update: {
      balance: 10000,
      bankName: 'Demo Bank',
      accountName: 'Somitee HQ Account'
    },
    create: {
      id: 'sample-bank-account-id',
      bankName: 'Demo Bank',
      accountName: 'Somitee HQ Account',
      accountNumber: '1234567890',
      balance: 10000,
      openingBalance: 10000,
      somiteeId: somitee.id,
      userId: adminUser.id
    }
  });

  await prisma.faq.upsert({
    where: { id: 'sample-faq-id' },
    update: {
      question: 'How do I add a member?',
      answer: 'Go to Members and click Add New Member.',
      category: 'General'
    },
    create: {
      id: 'sample-faq-id',
      question: 'How do I add a member?',
      answer: 'Go to Members and click Add New Member.',
      category: 'General'
    }
  });

  await prisma.notification.upsert({
    where: { id: 'sample-notification-id' },
    update: {
      type: 'info',
      title: 'Welcome to Somitee HQ',
      message: 'Your demo workspace is ready to use.'
    },
    create: {
      id: 'sample-notification-id',
      type: 'info',
      title: 'Welcome to Somitee HQ',
      message: 'Your demo workspace is ready to use.',
      read: false,
      somiteeId: somitee.id
    }
  });

  await prisma.smsConfig.upsert({
    where: { id: 'sample-sms-config-id' },
    update: {
      provider: 'twilio',
      apiKey: 'abc123',
      senderId: 'SOMITEE',
      autoSendOnPayment: true
    },
    create: {
      id: 'sample-sms-config-id',
      provider: 'twilio',
      apiKey: 'abc123',
      senderId: 'SOMITEE',
      autoSendOnPayment: true,
      autoSendDueReminder: false
    }
  });

  // Seed preset roles
  const presetRoles = [
    {
      id: 'role-collector',
      name: 'Collector',
      description: 'Can record collections, requires approval',
      permissions: ['collection.create'],
      isPreset: true,
    },
    {
      id: 'role-accountant',
      name: 'Accountant',
      description: 'Handles daily accounting tasks',
      permissions: ['collection.create', 'expense.create', 'bank.create', 'reports.view'],
      isPreset: true,
    },
    {
      id: 'role-approver',
      name: 'Approver',
      description: 'Can approve/reject financial transactions',
      permissions: ['collection.approve', 'expense.approve', 'bank.approve', 'member.approve', 'reports.view'],
      isPreset: true,
    },
    {
      id: 'role-viewer',
      name: 'Viewer',
      description: 'Read-only access to reports',
      permissions: ['reports.view'],
      isPreset: true,
    },
  ];

  for (const role of presetRoles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: role,
      create: role,
    });
  }

  console.log('Sample seed data inserted successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
