import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

function generateOTP(): string {
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  return otp;
}

const sendOTP = async (email: string, otp: string): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL as string,
      pass: process.env.PASS as string,
    },
  });

  const subject = "Authentication OTP for SurvEye";
  const text = `Your OTP for authentication on SurvEye is: ${otp}`;

  const mailOptions = {
    from: process.env.MAIL as string,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

export { sendOTP, generateOTP };
