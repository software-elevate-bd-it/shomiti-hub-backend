import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      success: true,
      statusCode: 200,
      message: 'SomiteeHQ API is healthy',
      data: { uptime: process.uptime() }
    };
  }
}
