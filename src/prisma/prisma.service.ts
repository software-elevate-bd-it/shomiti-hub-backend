import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.waitForDb();
    await this.$connect();
  }

  private async waitForDb(retries = 10, delay = 3000) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.$queryRaw`SELECT 1`;
        return;
      } catch (e) {
        console.log(`⏳ DB not ready, retry ${i + 1}/${retries}`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw new Error('❌ Database not reachable after retries');
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
