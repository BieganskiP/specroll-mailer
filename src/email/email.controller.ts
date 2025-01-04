import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
    try {
      const recipientEmails = this.configService
        .get<string>('NOTIFICATION_EMAILS')
        .split(',');

      console.log('Sending confirmation email to:', contactForm.email);
      // Send confirmation email to the user
      await this.emailService.sendConfirmationEmail(
        contactForm.email,
        contactForm.name,
        contactForm.topic,
        contactForm.message,
      );

      console.log('Sending notification email to:', recipientEmails);
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
    } catch (error) {
      console.error('Error sending emails:', error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_GATEWAY,
          error: 'Failed to send emails',
          details: error.message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
