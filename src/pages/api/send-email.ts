import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, html, text, emailSettings } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Use email settings from request body if provided, otherwise fall back to environment variables
    const emailConfig = emailSettings || {
      emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
      emailPort: parseInt(process.env.EMAIL_PORT || '587'),
      emailSecure: process.env.EMAIL_SECURE === 'true',
      emailUser: process.env.EMAIL_USER,
      emailPassword: process.env.EMAIL_PASS,
      emailFrom: process.env.EMAIL_FROM
    };

    if (!emailConfig.emailUser || !emailConfig.emailPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email configuration is incomplete. Please configure email settings in System Settings.' 
      });
    }

    // Create transporter using configuration
    const transporter = nodemailer.createTransporter({
      host: emailConfig.emailHost,
      port: emailConfig.emailPort,
      secure: emailConfig.emailSecure,
      auth: {
        user: emailConfig.emailUser,
        pass: emailConfig.emailPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: emailConfig.emailFrom || emailConfig.emailUser,
      to: to,
      subject: subject,
      html: html,
      text: text,
    });

    console.log('Email sent:', info.messageId);
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}