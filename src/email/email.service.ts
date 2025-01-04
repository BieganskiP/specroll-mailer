import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');

    this.logger.log(
      `Initializing SMTP transport with host: ${host}, port: ${port}, user: ${user}`,
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: {
        user,
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed:', error);
      throw error;
    }
  }

  async sendConfirmationEmail(
    email: string,
    name: string,
    topic: string,
    message: string,
  ) {
    await this.verifyConnection();
    this.logger.log(`Sending confirmation email to ${email}`);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: email,
        subject: 'Dziękujemy za kontakt ze Specroll',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; padding: 20px 0; background-color: #f8f9fa; border-radius: 5px;">
                <h1 style="color: #333; margin: 0; font-size: 24px;">Dziękujemy za kontakt ze Specroll</h1>
            </div>
            
            <div style="padding: 20px 0;">
                <p style="color: #444; font-size: 16px; line-height: 1.6;">Szanowny/a <strong>${name}</strong>,</p>
                
                <p style="color: #444; font-size: 16px; line-height: 1.6;">
                    Dziękujemy za przesłanie formularza kontaktowego. Potwierdzamy otrzymanie Twojej wiadomości i zapewniamy, że skontaktujemy się z Tobą tak szybko, jak to możliwe.
                </p>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Podsumowanie Twojego zapytania:</h3>
                    <p style="margin: 10px 0;"><strong style="color: #555;">Temat:</strong> ${topic}</p>
                    <p style="margin: 10px 0;"><strong style="color: #555;">Wiadomość:</strong></p>
                    <p style="color: #666; background-color: #fff; padding: 10px; border-radius: 3px; margin: 5px 0;">${message}</p>
                </div>

                <p style="color: #444; font-size: 16px; line-height: 1.6;">
                    W przypadku jakichkolwiek dodatkowych pytań, prosimy o kontakt zwrotny na ten adres email.
                </p>
            </div>

            <div style="border-top: 2px solid #f8f9fa; padding-top: 20px; margin-top: 20px;">
                <p style="color: #444; margin: 5px 0;">Z poważaniem,</p>
                <p style="color: #333; font-weight: bold; margin: 5px 0;">Zespół Specroll</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <a href="https://www.specroll.pl" style="color: #007bff; text-decoration: none; font-weight: bold;">www.specroll.pl</a>
                </div>

                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px; margin: 10px;">
                        <h4 style="color: #333; margin: 0 0 10px 0;">Kontakt</h4>
                        <p style="color: #666; margin: 5px 0;">
                            <strong>Tel:</strong> +48 666 088 953<br>
                            <strong>Tel:</strong> +48 694 749 815<br>
                            <strong>NIP:</strong> 8863018777<br>
                            <strong>REGON:</strong> 520410221
                        </p>
                    </div>

                    <div style="flex: 1; min-width: 250px; margin: 10px;">
                        <h4 style="color: #333; margin: 0 0 10px 0;">Godziny otwarcia</h4>
                        <p style="color: #666; margin: 5px 0;">
                            <strong>Poniedziałek - Piątek:</strong> 9:00 - 17:00<br>
                            <strong>Sobota:</strong> 10:00 - 14:00<br>
                            <strong>Niedziela:</strong> Zamknięte
                        </p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 15px;">
                    <p style="color: #666; margin: 5px 0;">
                        <a href="https://www.specroll.pl/produkty" style="color: #007bff; text-decoration: none; margin: 0 10px;">Produkty</a> |
                        <a href="https://www.specroll.pl/uslugi" style="color: #007bff; text-decoration: none; margin: 0 10px;">Usługi</a> |
                        <a href="https://www.specroll.pl/realizacje" style="color: #007bff; text-decoration: none; margin: 0 10px;">Realizacje</a> |
                        <a href="https://www.specroll.pl/kontakt" style="color: #007bff; text-decoration: none; margin: 0 10px;">Kontakt</a>
                    </p>
                </div>
            </div>
        </div>
      `,
      });
      this.logger.log(`Confirmation email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendNotificationEmail(
    recipientEmails: string[],
    name: string,
    email: string,
    phone: string,
    topic: string,
    message: string,
  ) {
    await this.verifyConnection();
    this.logger.log(
      `Sending notification email to ${recipientEmails.join(', ')}`,
    );

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: recipientEmails.join(','),
        subject: `Nowa wiadomość z formularza kontaktowego: ${topic}`,
        html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię i nazwisko:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Temat:</strong> ${topic}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${message}</p>
      `,
      });
      this.logger.log(
        `Notification email sent successfully to ${recipientEmails.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification email to ${recipientEmails.join(', ')}:`,
        error,
      );
      throw error;
    }
  }
}
