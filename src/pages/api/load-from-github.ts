import type { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeInput } from '@/utils/security';

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

interface LoadDataRequest {
  dataType: string; // 'athletes', 'payments', 'trainings', etc.
  fileName?: string; // optional specific filename
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get parameters from query (GET) or body (POST)
    const { dataType, fileName } = req.method === 'GET' ? req.query : req.body;

    // Validate required environment variables
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      console.error('GitHub configuration missing');
      return res.status(500).json({ 
        message: 'GitHub yapılandırması eksik',
        success: false 
      });
    }

    // Sanitize inputs
    const sanitizedDataType = sanitizeInput(dataType as string, 50);
    if (!sanitizedDataType) {
      return res.status(400).json({ message: 'Geçerli bir veri tipi belirtin' });
    }

    // GitHub API headers
    const headers = {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    };

    let filePath: string;
    let fileData: any = null;

    if (fileName) {
      // Load specific file
      filePath = `data/${sanitizedDataType}/${fileName}`;
      
      try {
        const response = await fetch(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filePath}`,
          { headers }
        );

        if (response.ok) {
          const file: GitHubFileResponse = await response.json();
          const content = Buffer.from(file.content, 'base64').toString('utf-8');
          fileData = JSON.parse(content);
        }
      } catch (error) {
        console.log(`Specific file not found: ${filePath}`);
      }
    } else {
      // Load latest file from directory
      try {
        const dirResponse = await fetch(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/data/${sanitizedDataType}`,
          { headers }
        );

        if (dirResponse.ok) {
          const files = await dirResponse.json();
          
          if (Array.isArray(files) && files.length > 0) {
            // Sort files by name (which includes timestamp) and get the latest
            const sortedFiles = files
              .filter(file => file.name.endsWith('.json'))
              .sort((a, b) => b.name.localeCompare(a.name));

            if (sortedFiles.length > 0) {
              const latestFile = sortedFiles[0];
              
              const fileResponse = await fetch(latestFile.download_url, { headers });
              if (fileResponse.ok) {
                fileData = await fileResponse.json();
              }
            }
          }
        }
      } catch (error) {
        console.log(`Directory not found or empty: data/${sanitizedDataType}`);
      }
    }

    if (!fileData) {
      return res.status(404).json({
        message: 'Dosya bulunamadı',
        success: false,
        dataType: sanitizedDataType
      });
    }

    console.log('Data loaded from GitHub:', {
      dataType: sanitizedDataType,
      fileName: fileName || 'latest',
      timestamp: fileData.timestamp
    });

    res.status(200).json({
      message: 'Veri başarıyla GitHub\'dan yüklendi',
      success: true,
      data: fileData.data || fileData, // Handle both wrapped and unwrapped data
      metadata: {
        timestamp: fileData.timestamp,
        dataType: fileData.dataType || sanitizedDataType,
        source: fileData.source
      }
    });

  } catch (error) {
    console.error('Load from GitHub error:', error);
    res.status(500).json({
      message: 'GitHub\'dan yükleme sırasında bir hata oluştu',
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}