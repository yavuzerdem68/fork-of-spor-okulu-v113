import type { NextApiRequest, NextApiResponse } from 'next';
import { WordPressAPI, AthleteWordPressStorage } from '../../lib/wordpress-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // WordPress API credentials should be set in environment or passed from client
  const wpUrl = process.env.WORDPRESS_SITE_URL || 'https://www.g7spor.org';
  const wpUser = req.headers['wp-username'] as string;
  const wpPass = req.headers['wp-password'] as string;

  if (!wpUser || !wpPass) {
    return res.status(401).json({ 
      error: 'WordPress credentials required',
      message: 'wp-username and wp-password headers are required'
    });
  }

  try {
    const wpApi = new WordPressAPI(wpUrl, wpUser, wpPass);
    const athleteStorage = new AthleteWordPressStorage(wpApi);

    switch (req.method) {
      case 'GET':
        const athletes = await athleteStorage.getAthletes();
        return res.status(200).json(athletes);

      case 'POST':
        const newAthleteId = await athleteStorage.saveAthlete(req.body);
        return res.status(201).json({ 
          success: true, 
          id: newAthleteId,
          message: 'Sporcu başarıyla kaydedildi'
        });

      case 'PUT':
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Athlete ID is required for update' });
        }
        await athleteStorage.updateAthlete(id, updateData);
        return res.status(200).json({ 
          success: true,
          message: 'Sporcu başarıyla güncellendi'
        });

      case 'DELETE':
        const deleteId = req.query.id as string;
        if (!deleteId) {
          return res.status(400).json({ error: 'Athlete ID is required for deletion' });
        }
        await athleteStorage.deleteAthlete(deleteId);
        return res.status(200).json({ 
          success: true,
          message: 'Sporcu başarıyla silindi'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error: any) {
    console.error('WordPress API Error:', error);
    return res.status(500).json({ 
      error: 'WordPress API Error',
      message: error.message || 'Bilinmeyen bir hata oluştu'
    });
  }
}