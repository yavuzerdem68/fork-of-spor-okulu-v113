import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check GitHub environment variables
    const githubEnvs = {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET',
      GITHUB_OWNER: process.env.GITHUB_OWNER ? 'SET' : 'NOT SET',
      GITHUB_REPO: process.env.GITHUB_REPO ? 'SET' : 'NOT SET',
    };

    // Get all environment variable names (without values for security)
    const allEnvNames = Object.keys(process.env).filter(key => 
      key.startsWith('GITHUB_') || 
      key.startsWith('NEXT_PUBLIC_') ||
      key.startsWith('EMAIL_')
    );

    res.status(200).json({
      message: 'Environment variables debug info',
      githubEnvs,
      allEnvNames,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug env error:', error);
    res.status(500).json({
      message: 'Debug error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}