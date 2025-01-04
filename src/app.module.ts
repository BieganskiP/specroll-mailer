import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';

const validateConfig = (config: Record<string, string>) => {
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM',
    'NOTIFICATION_EMAILS',
  ];

  for (const var_ of requiredVars) {
    if (!config[var_]) {
      throw new Error(`Missing required environment variable: ${var_}`);
    }
  }
  return config;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    EmailModule,
  ],
})
export class AppModule {}
