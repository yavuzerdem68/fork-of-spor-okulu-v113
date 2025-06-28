import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      GITHUB_OWNER: !!process.env.GITHUB_OWNER,
      GITHUB_REPO: !!process.env.GITHUB_REPO,
      GITHUB_TOKEN_LENGTH: process.env.GITHUB_TOKEN?.length || 0,
      GITHUB_OWNER_VALUE: process.env.GITHUB_OWNER || 'NOT_SET',
      GITHUB_REPO_VALUE: process.env.GITHUB_REPO || 'NOT_SET'
    };

    // Test GitHub API connectivity (without making actual changes)
    let githubApiTest = null;
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`,
          {
            headers: {
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            }
          }
        );

        githubApiTest = {
          status: response.status,
          statusText: response.statusText,
          accessible: response.ok,
          rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
          rateLimitReset: response.headers.get('x-ratelimit-reset')
        };

        if (response.ok) {
          const repoData = await response.json();
          githubApiTest.repoName = repoData.name;
          githubApiTest.repoFullName = repoData.full_name;
          githubApiTest.permissions = repoData.permissions;
        }
      } catch (error) {
        githubApiTest = {
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        };
      }
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      envCheck,
      githubApiTest,
      success: true
    });

  } catch (error) {
    console.error('Debug GitHub error:', error);
    res.status(500).json({
      message: 'Debug işlemi sırasında bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      success: false
    });
  }
}