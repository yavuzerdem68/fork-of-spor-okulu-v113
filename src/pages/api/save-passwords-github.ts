import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const passwordData = req.body;
    const fileName = 'passwords.json';
    const content = JSON.stringify(passwordData, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    // Önce dosyanın var olup olmadığını kontrol et
    let sha: string | undefined;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
      }
    } catch (error) {
      // Dosya yoksa devam et
    }

    // Dosyayı oluştur veya güncelle
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Şifreler güncellendi - ${new Date().toISOString()}`,
          content: encodedContent,
          ...(sha && { sha })
        }),
      }
    );

    if (response.ok) {
      res.status(200).json({ 
        success: true, 
        message: 'Şifreler GitHub\'a kaydedildi' 
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'GitHub API hatası');
    }

  } catch (error) {
    console.error('GitHub şifre kaydetme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: `Hata: ${error}` 
    });
  }
}