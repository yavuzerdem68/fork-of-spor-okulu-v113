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
      GITHUB_REPO_VALUE: process.env.GITHUB_REPO || 'NOT_SET',
      GITHUB_TOKEN_PREFIX: process.env.GITHUB_TOKEN?.substring(0, 8) + '...' || 'NOT_SET'
    };

    // Test GitHub API connectivity and detailed diagnostics
    let githubApiTest = null;
    let userTest = null;
    let repoListTest = null;
    
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
      const headers = {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SportsCRM-GitHub-Diagnostic'
      };

      // Test 1: Check if token is valid by getting user info
      try {
        const userResponse = await fetch('https://api.github.com/user', { headers });
        userTest = {
          status: userResponse.status,
          statusText: userResponse.statusText,
          accessible: userResponse.ok,
          rateLimitRemaining: userResponse.headers.get('x-ratelimit-remaining'),
          rateLimitReset: userResponse.headers.get('x-ratelimit-reset')
        };

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userTest.username = userData.login;
          userTest.userType = userData.type;
          userTest.scopes = userResponse.headers.get('x-oauth-scopes');
        } else {
          const errorData = await userResponse.text();
          userTest.error = errorData;
        }
      } catch (error) {
        userTest = {
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        };
      }

      // Test 2: List repositories for the owner to see if owner exists
      try {
        const repoListResponse = await fetch(
          `https://api.github.com/users/${process.env.GITHUB_OWNER}/repos?per_page=5`,
          { headers }
        );
        
        repoListTest = {
          status: repoListResponse.status,
          statusText: repoListResponse.statusText,
          accessible: repoListResponse.ok
        };

        if (repoListResponse.ok) {
          const repos = await repoListResponse.json();
          repoListTest.repoCount = repos.length;
          repoListTest.sampleRepos = repos.slice(0, 3).map((repo: any) => repo.name);
          repoListTest.targetRepoExists = repos.some((repo: any) => repo.name === process.env.GITHUB_REPO);
        } else {
          const errorData = await repoListResponse.text();
          repoListTest.error = errorData;
        }
      } catch (error) {
        repoListTest = {
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        };
      }

      // Test 3: Try to access the specific repository
      try {
        const response = await fetch(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`,
          { headers }
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
          githubApiTest.private = repoData.private;
          githubApiTest.defaultBranch = repoData.default_branch;
        } else {
          const errorData = await response.text();
          githubApiTest.error = errorData;
        }
      } catch (error) {
        githubApiTest = {
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        };
      }
    }

    // Generate diagnostic summary
    const diagnosticSummary = {
      configurationComplete: envCheck.GITHUB_TOKEN && envCheck.GITHUB_OWNER && envCheck.GITHUB_REPO,
      tokenValid: userTest?.accessible || false,
      ownerExists: repoListTest?.accessible || false,
      repositoryAccessible: githubApiTest?.accessible || false,
      possibleIssues: []
    };

    // Identify possible issues
    if (!envCheck.GITHUB_TOKEN) {
      diagnosticSummary.possibleIssues.push('GITHUB_TOKEN environment variable is not set');
    } else if (envCheck.GITHUB_TOKEN_LENGTH < 20) {
      diagnosticSummary.possibleIssues.push('GITHUB_TOKEN appears to be too short (should be 40+ characters)');
    }

    if (!envCheck.GITHUB_OWNER) {
      diagnosticSummary.possibleIssues.push('GITHUB_OWNER environment variable is not set');
    }

    if (!envCheck.GITHUB_REPO) {
      diagnosticSummary.possibleIssues.push('GITHUB_REPO environment variable is not set');
    }

    if (userTest && !userTest.accessible) {
      if (userTest.status === 401) {
        diagnosticSummary.possibleIssues.push('GitHub token is invalid or expired');
      } else {
        diagnosticSummary.possibleIssues.push(`GitHub API authentication failed: ${userTest.statusText}`);
      }
    }

    if (repoListTest && !repoListTest.accessible && repoListTest.status === 404) {
      diagnosticSummary.possibleIssues.push(`GitHub user/organization '${envCheck.GITHUB_OWNER_VALUE}' does not exist`);
    }

    if (repoListTest?.accessible && !repoListTest.targetRepoExists) {
      diagnosticSummary.possibleIssues.push(`Repository '${envCheck.GITHUB_REPO_VALUE}' does not exist under '${envCheck.GITHUB_OWNER_VALUE}'`);
    }

    if (githubApiTest && !githubApiTest.accessible) {
      if (githubApiTest.status === 404) {
        diagnosticSummary.possibleIssues.push(`Repository '${envCheck.GITHUB_OWNER_VALUE}/${envCheck.GITHUB_REPO_VALUE}' not found or not accessible`);
      } else if (githubApiTest.status === 403) {
        diagnosticSummary.possibleIssues.push('Access denied - token may not have required permissions');
      }
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      envCheck,
      userTest,
      repoListTest,
      githubApiTest,
      diagnosticSummary,
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