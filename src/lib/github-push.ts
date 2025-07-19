/**
 * GitHub Push Utility
 * Kod değişikliklerini GitHub repository'ye push etmek için yardımcı fonksiyonlar
 */

interface PushToGitHubOptions {
  commitMessage: string;
  files?: { [path: string]: string };
  branch?: string;
}

interface GitHubPushResponse {
  success: boolean;
  message: string;
  commitSha?: string;
  commitUrl?: string;
  branch?: string;
  filesCommitted?: number;
  error?: string;
}

/**
 * Kod değişikliklerini GitHub'a push et
 */
export async function pushToGitHub(options: PushToGitHubOptions): Promise<GitHubPushResponse> {
  try {
    const response = await fetch('/api/push-to-github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'GitHub push hatası');
    }

    return result;
  } catch (error) {
    console.error('GitHub push error:', error);
    return {
      success: false,
      message: 'GitHub\'a push sırasında bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
}

/**
 * Deployment sonrası otomatik GitHub push
 */
export async function autoDeployPush(commitMessage: string): Promise<GitHubPushResponse> {
  return pushToGitHub({
    commitMessage: `[AUTO-DEPLOY] ${commitMessage}`,
    branch: 'main'
  });
}

/**
 * Belirli dosyaları GitHub'a push et
 */
export async function pushSpecificFiles(
  files: { [path: string]: string }, 
  commitMessage: string,
  branch: string = 'main'
): Promise<GitHubPushResponse> {
  return pushToGitHub({
    commitMessage,
    files,
    branch
  });
}

/**
 * GitHub push durumunu kontrol et
 */
export function checkGitHubPushConfig(): boolean {
  // Client-side'da environment variable'ları kontrol edemeyiz
  // Bu fonksiyon server-side'da kullanılmalı
  if (typeof window !== 'undefined') {
    console.warn('GitHub push config check should be done server-side');
    return false;
  }
  
  return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

/**
 * Deployment log dosyası oluştur
 */
export function createDeploymentLog(commitMessage: string, deploymentUrl?: string): string {
  const timestamp = new Date().toISOString();
  
  return `# Deployment Log

**Timestamp:** ${timestamp}
**Commit Message:** ${commitMessage}
**Deployment URL:** ${deploymentUrl || 'N/A'}
**Environment:** ${process.env.NODE_ENV || 'development'}

## Changes
This deployment includes the latest code changes from the development environment.

## Status
✅ Deployment completed successfully
✅ Code pushed to GitHub automatically
${deploymentUrl ? `✅ Preview available at: ${deploymentUrl}` : ''}

---
*This file was generated automatically by the SportsCRM deployment system.*
`;
}