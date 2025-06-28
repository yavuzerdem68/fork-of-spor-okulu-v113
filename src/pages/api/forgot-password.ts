import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { hashPassword } from '@/utils/security';
import { sanitizeInput } from '@/utils/security';

// Create email transporter with proper configuration
const createTransporter = () => {
  // Check if we have email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    return null;
  }

  // Use Gmail SMTP configuration
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // Sanitize input
    const sanitizedEmail = sanitizeInput(email?.trim(), 100);

    if (!sanitizedEmail) {
      return res.status(400).json({ message: 'Geçerli bir email adresi girin' });
    }

    // Since we're using localStorage in the frontend, we need to simulate the user lookup
    // In a real application, this would query a database
    
    // For now, we'll generate the password and send the email
    // The frontend will handle updating localStorage
    const tempPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Create email transporter
    const transporter = createTransporter();

    if (!transporter) {
      throw new Error('Email yapılandırması eksik. Lütfen sistem yöneticisi ile iletişime geçin.');
    }

    // Email template
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: sanitizedEmail,
      subject: 'SportsCRM - Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #2563eb; margin: 0;">SportsCRM</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Şifre Sıfırlama Talebi</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Merhaba,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              SportsCRM hesabınız için şifre sıfırlama talebinde bulundunuz. 
              Aşağıdaki geçici şifre ile giriş yapabilirsiniz:
            </p>
            
            <div style="background-color: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Geçici Şifreniz:</p>
              <p style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #1f2937; margin: 0; letter-spacing: 2px;">
                ${tempPassword}
              </p>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Önemli Güvenlik Uyarısı:</strong><br>
                Bu geçici bir şifredir. Güvenliğiniz için giriş yaptıktan hemen sonra şifrenizi değiştirin.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Giriş yapmak için <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://spor-okulu.vercel.app'}/login" 
              style="color: #2563eb; text-decoration: none;">buraya tıklayın</a>.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz. 
              Hesabınızın güvenliği için şifreniz değiştirilmemiştir.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Bu e-posta SportsCRM tarafından otomatik olarak gönderilmiştir.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent:', info.messageId);
    
    // Return the hashed password so the frontend can update localStorage
    res.status(200).json({ 
      message: 'Şifre sıfırlama e-postası gönderildi',
      hashedPassword,
      success: true
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu',
      success: false 
    });
  }
}