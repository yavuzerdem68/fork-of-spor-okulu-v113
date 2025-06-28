import type { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeInput } from '@/utils/security';

interface GitHubFileResponse {
  sha?: string;
  content: string;
}

interface SaveDataRequest {
  dataType: string; // 'athletes', 'payments', 'trainings', etc.
  data: any;
  fileName?: string; // optional custom filename
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { dataType, data, fileName }: SaveDataRequest = req.body;

    // Validate required environment variables
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      console.error('GitHub configuration missing');
      return res.status(500).json({ 
        message: 'GitHub yapılandırması eksik',
        success: false 
      });
    }

    // Sanitize inputs
    const sanitizedDataType = sanitizeInput(dataType, 50);
    if (!sanitizedDataType) {
      return res.status(400).json({ message: 'Geçerli bir veri tipi belirtin' });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFileName = fileName || `${sanitizedDataType}-${timestamp}.json`;
    const filePath = `data/${sanitizedDataType}/${finalFileName}`;

    // Prepare data with metadata
    const fileContent = {
      timestamp: new Date().toISOString(),
      dataType: sanitizedDataType,
      source: 'SportsCRM Web Application',
      data: data
    };

    // Convert to base64
    const contentBase64 = Buffer.from(JSON.stringify(fileContent, null, 2)).toString('base64');

    // GitHub API headers
    const headers = {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Check if file exists (to get SHA for update)
    let existingFileSha: string | undefined;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`,
        { headers }
      );
      
      if (checkResponse.ok) {
        const existingFile: GitHubFileResponse = await checkResponse.json();
        existingFileSha = existingFile.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine for new files
      console.log('File does not exist, creating new file');
    }

    // Prepare commit data
    const commitData = {
      message: `Add ${sanitizedDataType} data - ${new Date().toLocaleString('tr-TR')}`,
      content: contentBase64,
      ...(existingFileSha && { sha: existingFileSha })
    };

    // Create or update file in GitHub
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(commitData)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('Data saved to GitHub:', {
      path: filePath,
      sha: result.content?.sha,
      url: result.content?.html_url
    });

    res.status(200).json({
      message: 'Veri başarıyla GitHub\'a kaydedildi',
      success: true,
      filePath,
      githubUrl: result.content?.html_url,
      sha: result.content?.sha
    });

  } catch (error) {
    console.error('Save to GitHub error:', error);
    res.status(500).json({
      message: 'GitHub\'a kaydetme sırasında bir hata oluştu',
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}