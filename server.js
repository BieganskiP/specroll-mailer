require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, topic, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !topic || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Send email to administrators
    const recipientEmails = process.env.RECIPIENT_EMAILS.split(",");
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmails.join(","),
      subject: `New Contact Form Submission: ${topic}`,
      html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Topic:</strong> ${topic}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
    });

    // Send confirmation email to the client
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Thank you for contacting Specroll",
      html: `
                <h2>Thank you for contacting Specroll</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Here's a summary of your inquiry:</p>
                <p><strong>Topic:</strong> ${topic}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <br>
                <p>Best regards,</p>
                <p>Specroll Team</p>
            `,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
