import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

class ContactFormDto {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Post('contact')
  async handleContactForm(@Body() contactForm: ContactFormDto) {
    const recipientEmails = this.configService
      .get<string>('NOTIFICATION_EMAILS')
      .split(',');

    // Send confirmation email to the user
    await this.emailService.sendConfirmationEmail(
      contactForm.email,
      contactForm.name,
      contactForm.topic,
      contactForm.message,
    );

    // Send notification email to administrators
    await this.emailService.sendNotificationEmail(
      recipientEmails,
      contactForm.name,
      contactForm.email,
      contactForm.phone,
      contactForm.topic,
      contactForm.message,
    );

    return { message: 'Emails sent successfully' };
  }
}
