require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify SMTP connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    console.log("Received contact request:", req.body);
    const { name, email, phone, topic, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !topic || !message) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    // Send email to administrators
    const recipientEmails = process.env.RECIPIENT_EMAILS.split(",");
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmails.join(","),
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

    // Send confirmation email to the client
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Dziękujemy za kontakt ze Specroll",
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

    console.log("Emails sent successfully");
    res.status(200).json({ message: "Wiadomość została wysłana pomyślnie" });
  } catch (error) {
    console.error("Błąd wysyłania wiadomości:", error);
    res.status(500).json({
      error: "Nie udało się wysłać wiadomości",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Wystąpił błąd serwera", details: err.message });
});

// Start server with error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Environment variables loaded:", {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_FROM: process.env.SMTP_FROM,
    RECIPIENT_EMAILS: process.env.RECIPIENT_EMAILS,
  });
});
