import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return res.status(500).json({ 
        success: false, 
        message: 'GitHub yapılandırması eksik' 
      });
    }

    const fileName = 'passwords.json';

    // GitHub'dan dosyayı al
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      return res.status(404).json({ 
        success: false, 
        message: 'GitHub\'da şifre dosyası bulunamadı' 
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'GitHub API hatası');
    }

    const fileData = await response.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const passwordData = JSON.parse(content);

    res.status(200).json({ 
      success: true, 
      data: passwordData,
      message: 'Şifreler GitHub\'dan yüklendi' 
    });

  } catch (error) {
    console.error('GitHub şifre yükleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: `Hata: ${error}` 
    });
  }
}