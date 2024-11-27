import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

function generatePassword(): string {
  const password = Math.floor(1000000 + Math.random() * 9000000).toString();
  return password;
}

const sendPassword = async (email: string, password: string): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL as string,
      pass: process.env.PASS as string,
    },
  });

  const subject = 'Password From Surveye';
  const text = `Your password on SurvEye is: ${password}`;

  console.log(`the new password is : ${password}`);

  const mailOptions = {
    from: process.env.MAIL as string,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending mail:', error);
  }
};

export { sendPassword, generatePassword };
