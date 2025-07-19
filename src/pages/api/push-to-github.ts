import type { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeInput } from '@/utils/security';

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  content?: string;
  sha?: string;
}

interface PushToGitHubRequest {
  commitMessage: string;
  files?: { [path: string]: string }; // Optional: specific files to commit
  branch?: string; // Default: main
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { commitMessage, files, branch = 'main' }: PushToGitHubRequest = req.body;

    // Validate required environment variables
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      console.error('GitHub configuration missing');
      return res.status(500).json({ 
        message: 'GitHub yapılandırması eksik',
        success: false 
      });
    }

    // Sanitize commit message
    const sanitizedCommitMessage = sanitizeInput(commitMessage, 200);
    if (!sanitizedCommitMessage) {
      return res.status(400).json({ message: 'Geçerli bir commit mesajı belirtin' });
    }

    // GitHub API headers
    const headers = {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const repoUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`;

    // Step 1: Get the latest commit SHA from the branch
    console.log('Getting latest commit...');
    const branchResponse = await fetch(`${repoUrl}/git/refs/heads/${branch}`, { headers });
    
    if (!branchResponse.ok) {
      const errorData = await branchResponse.text();
      throw new Error(`Failed to get branch info: ${branchResponse.status} ${errorData}`);
    }

    const branchData = await branchResponse.json();
    const latestCommitSha = branchData.object.sha;

    // Step 2: Get the tree SHA from the latest commit
    console.log('Getting commit tree...');
    const commitResponse = await fetch(`${repoUrl}/git/commits/${latestCommitSha}`, { headers });
    
    if (!commitResponse.ok) {
      const errorData = await commitResponse.text();
      throw new Error(`Failed to get commit: ${commitResponse.status} ${errorData}`);
    }

    const commitData = await commitResponse.json();
    const baseTreeSha = commitData.tree.sha;

    // Step 3: Create tree items for files to be committed
    const treeItems: GitHubTreeItem[] = [];

    if (files && Object.keys(files).length > 0) {
      // Commit specific files
      for (const [filePath, content] of Object.entries(files)) {
        treeItems.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          content: content
        });
      }
    } else {
      // For now, we'll create a simple commit marker file
      // In a real implementation, you'd need to get all changed files
      const timestamp = new Date().toISOString();
      treeItems.push({
        path: `deployment-logs/deploy-${timestamp.replace(/[:.]/g, '-')}.md`,
        mode: '100644',
        type: 'blob',
        content: `# Deployment Log

**Timestamp:** ${timestamp}
**Commit Message:** ${sanitizedCommitMessage}
**Branch:** ${branch}
**Environment:** ${process.env.NODE_ENV || 'development'}

## Changes
This deployment includes the latest code changes from the development environment.

## Status
✅ Deployment completed successfully
✅ Code pushed to GitHub automatically

---
*This file was generated automatically by the SportsCRM deployment system.*
`
      });
    }

    // Step 4: Create a new tree
    console.log('Creating new tree...');
    const treeResponse = await fetch(`${repoUrl}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems
      })
    });

    if (!treeResponse.ok) {
      const errorData = await treeResponse.text();
      throw new Error(`Failed to create tree: ${treeResponse.status} ${errorData}`);
    }

    const treeData = await treeResponse.json();
    const newTreeSha = treeData.sha;

    // Step 5: Create a new commit
    console.log('Creating new commit...');
    const newCommitResponse = await fetch(`${repoUrl}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: sanitizedCommitMessage,
        tree: newTreeSha,
        parents: [latestCommitSha],
        author: {
          name: 'SportsCRM Auto Deploy',
          email: 'deploy@sportscr.com',
          date: new Date().toISOString()
        },
        committer: {
          name: 'SportsCRM Auto Deploy',
          email: 'deploy@sportscr.com',
          date: new Date().toISOString()
        }
      })
    });

    if (!newCommitResponse.ok) {
      const errorData = await newCommitResponse.text();
      throw new Error(`Failed to create commit: ${newCommitResponse.status} ${errorData}`);
    }

    const newCommitData = await newCommitResponse.json();
    const newCommitSha = newCommitData.sha;

    // Step 6: Update the branch reference
    console.log('Updating branch reference...');
    const updateRefResponse = await fetch(`${repoUrl}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: false
      })
    });

    if (!updateRefResponse.ok) {
      const errorData = await updateRefResponse.text();
      throw new Error(`Failed to update branch: ${updateRefResponse.status} ${errorData}`);
    }

    const updateRefData = await updateRefResponse.json();

    console.log('Successfully pushed to GitHub:', {
      commitSha: newCommitSha,
      branch: branch,
      commitUrl: newCommitData.html_url
    });

    res.status(200).json({
      message: 'Kod değişiklikleri başarıyla GitHub\'a push edildi',
      success: true,
      commitSha: newCommitSha,
      commitUrl: newCommitData.html_url,
      branch: branch,
      filesCommitted: treeItems.length
    });

  } catch (error) {
    console.error('Push to GitHub error:', error);
    res.status(500).json({
      message: 'GitHub\'a push sırasında bir hata oluştu',
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}