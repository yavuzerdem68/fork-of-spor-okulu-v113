import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { formData } = req.body;

    if (!formData) {
      return res.status(400).json({ message: 'Form data is required' });
    }

    // Email configuration
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create JSON file content
    const studentAge = formData.studentBirthDate ? 
      new Date().getFullYear() - new Date(formData.studentBirthDate).getFullYear() : '';
    
    const formDataForEmail = {
      ...formData,
      studentAge,
      submissionDate: new Date().toISOString(),
      formVersion: "1.0"
    };

    const jsonContent = JSON.stringify(formDataForEmail, null, 2);
    const fileName = `sporcu-kayit-${formData.studentName}-${formData.studentSurname}-${new Date().toISOString().split('T')[0]}.json`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `Yeni Sporcu Kayıt Formu - ${formData.studentName} ${formData.studentSurname}`,
      html: `
        <h2>Yeni Sporcu Kayıt Formu</h2>
        <p><strong>Sporcu:</strong> ${formData.studentName} ${formData.studentSurname}</p>
        <p><strong>Veli:</strong> ${formData.parentName} ${formData.parentSurname}</p>
        <p><strong>Telefon:</strong> ${formData.parentPhone}</p>
        <p><strong>Email:</strong> ${formData.parentEmail}</p>
        <p><strong>Seçilen Sporlar:</strong> ${formData.selectedSports?.join(', ') || 'Belirtilmemiş'}</p>
        <p><strong>Gönderim Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        
        <hr>
        <p>Detaylı form bilgileri ekteki JSON dosyasında bulunmaktadır.</p>
        <p>Bu dosyayı sistem entegrasyonu sayfasından yükleyerek sporcu kaydını tamamlayabilirsiniz.</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: jsonContent,
          contentType: 'application/json'
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Form başarıyla gönderildi!',
      fileName: fileName
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      message: 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}