const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log("📧 sendEmail called with options:", {
    to: options.to,
    subject: options.subject,
  });

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can switch to SMTP if needed
      auth: {
        user: process.env.SMTP_EMAIL || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Aarit Jewels" <${process.env.SMTP_EMAIL || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    console.log("📨 Attempting to send email:", mailOptions);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.response || info);

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message || error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
