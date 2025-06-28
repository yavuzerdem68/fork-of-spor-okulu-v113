/**
 * GitHub Storage Utility
 * Form verilerini GitHub repository'ye kaydetmek için yardımcı fonksiyonlar
 */

interface SaveToGitHubOptions {
  dataType: string;
  data: any;
  fileName?: string;
}

interface GitHubSaveResponse {
  success: boolean;
  message: string;
  filePath?: string;
  githubUrl?: string;
  error?: string;
}

/**
 * Veriyi GitHub'a kaydet
 */
export async function saveToGitHub(options: SaveToGitHubOptions): Promise<GitHubSaveResponse> {
  try {
    const response = await fetch('/api/save-to-github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'GitHub kaydetme hatası');
    }

    return result;
  } catch (error) {
    console.error('GitHub storage error:', error);
    return {
      success: false,
      message: 'GitHub\'a kaydetme sırasında bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
}

/**
 * Sporcu verilerini kaydet
 */
export async function saveAthleteData(athleteData: any, fileName?: string) {
  return saveToGitHub({
    dataType: 'athletes',
    data: athleteData,
    fileName
  });
}

/**
 * Ödeme verilerini kaydet
 */
export async function savePaymentData(paymentData: any, fileName?: string) {
  return saveToGitHub({
    dataType: 'payments',
    data: paymentData,
    fileName
  });
}

/**
 * Antrenman verilerini kaydet
 */
export async function saveTrainingData(trainingData: any, fileName?: string) {
  return saveToGitHub({
    dataType: 'trainings',
    data: trainingData,
    fileName
  });
}

/**
 * Yoklama verilerini kaydet
 */
export async function saveAttendanceData(attendanceData: any, fileName?: string) {
  return saveToGitHub({
    dataType: 'attendance',
    data: attendanceData,
    fileName
  });
}

/**
 * Genel form verilerini kaydet
 */
export async function saveFormData(formType: string, formData: any, fileName?: string) {
  return saveToGitHub({
    dataType: formType,
    data: formData,
    fileName
  });
}

/**
 * Toplu veri kaydetme (birden fazla veri tipini aynı anda kaydet)
 */
export async function saveBulkData(dataItems: SaveToGitHubOptions[]): Promise<GitHubSaveResponse[]> {
  const results: GitHubSaveResponse[] = [];
  
  for (const item of dataItems) {
    const result = await saveToGitHub(item);
    results.push(result);
    
    // Kısa bir bekleme süresi ekle (GitHub API rate limiting için)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Veri kaydetme durumunu kontrol et
 */
export function checkGitHubConfig(): boolean {
  // Client-side'da environment variable'ları kontrol edemeyiz
  // Bu fonksiyon server-side'da kullanılmalı
  if (typeof window !== 'undefined') {
    console.warn('GitHub config check should be done server-side');
    return false;
  }
  
  return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}