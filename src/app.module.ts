import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { MembersModule } from './modules/members/members.module';
import { MemberRequestsModule } from './modules/member-requests/member-requests.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { CashbookModule } from './modules/cashbook/cashbook.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SmsModule } from './modules/sms/sms.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SomiteesModule } from './modules/admin/somitees/somitees.module';
import { AnalyticsModule } from './modules/admin/analytics/analytics.module';
import { SubscriptionsModule } from './modules/admin/subscriptions/subscriptions.module';
import { FaqModule } from './modules/faq/faq.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { CacheRedisModule } from './modules/cache/cache.module';
import { RolesModule } from './modules/roles/roles.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheRedisModule,
    PrismaModule,
    AuthModule,
    CompanyModule,
    MembersModule,
    MemberRequestsModule,
    CollectionsModule,
    ExpensesModule,
    LedgerModule,
    CashbookModule,
    BankAccountsModule,
    PaymentsModule,
    ReportsModule,
    SmsModule,
    SettingsModule,
    SomiteesModule,
    AnalyticsModule,
    SubscriptionsModule,
    FaqModule,
    NotificationsModule,
    ActivityLogModule,
    SearchModule,
    DashboardModule,
    SchedulerModule,
    RolesModule,
    ApprovalsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
