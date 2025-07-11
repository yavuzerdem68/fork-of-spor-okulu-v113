// Turkish Character Matching and Normalization Library
// Handles Turkish characters properly for payment matching

/**
 * Comprehensive Turkish character normalization
 * Handles all Turkish characters including İ,ı,ç,Ç,ğ,Ğ,Ü,ü,Ş,ş,Ö,ö
 */
export const normalizeTurkish = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Turkish specific character mappings
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Handle İ -> i conversion (Turkish capital I)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i') // English I also becomes i
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove punctuation and extra spaces
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Advanced Turkish similarity calculation
 * Uses multiple algorithms for better matching
 */
export const calculateTurkishSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  // Normalize both strings
  const norm1 = normalizeTurkish(str1);
  const norm2 = normalizeTurkish(str2);
  
  console.log(`🔍 Turkish Matching: "${str1}" -> "${norm1}" vs "${str2}" -> "${norm2}"`);
  
  // EXACT MATCH after normalization
  if (norm1 === norm2) {
    console.log('✅ EXACT TURKISH MATCH - 100%');
    return 100;
  }
  
  // Check if one completely contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    console.log('✅ COMPLETE CONTAINMENT - 95%');
    return 95;
  }
  
  // Word-based matching with Turkish awareness
  const words1 = norm1.split(' ').filter(w => w.length > 1);
  const words2 = norm2.split(' ').filter(w => w.length > 1);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Count exact word matches
  let exactMatches = 0;
  let partialMatches = 0;
  
  for (const word1 of words1) {
    let bestWordMatch = 0;
    
    for (const word2 of words2) {
      if (word1 === word2) {
        exactMatches++;
        bestWordMatch = 100;
        break;
      } else if (word1.includes(word2) || word2.includes(word1)) {
        bestWordMatch = Math.max(bestWordMatch, 80);
      } else {
        // Levenshtein distance for partial matches
        const distance = levenshteinDistance(word1, word2);
        const maxLen = Math.max(word1.length, word2.length);
        const similarity = ((maxLen - distance) / maxLen) * 100;
        bestWordMatch = Math.max(bestWordMatch, similarity);
      }
    }
    
    if (bestWordMatch >= 70) {
      partialMatches++;
    }
  }
  
  // Calculate final similarity
  const totalWords = Math.max(words1.length, words2.length);
  const exactScore = (exactMatches / totalWords) * 100;
  const partialScore = (partialMatches / totalWords) * 60; // Partial matches get lower score
  
  const finalScore = Math.max(exactScore, partialScore);
  
  console.log(`📊 Turkish Match Analysis: Exact=${exactMatches}/${totalWords}, Partial=${partialMatches}/${totalWords}, Score=${finalScore.toFixed(1)}%`);
  
  return Math.round(finalScore);
};

/**
 * Levenshtein distance calculation for string similarity
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Manual match persistence system
 */
export interface ManualMatch {
  id: string;
  normalizedDescription: string;
  originalDescription: string;
  athleteId: string;
  athleteName: string;
  parentName: string;
  isSiblingPayment: boolean;
  siblingIds?: string[];
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  confidence: number;
}

export class TurkishMatchingMemory {
  private static STORAGE_KEY = 'turkishPaymentMatches';
  
  /**
   * Save a manual match for future use
   */
  static saveManualMatch(
    description: string,
    athleteId: string,
    athleteName: string,
    parentName: string,
    isSiblingPayment: boolean = false,
    siblingIds?: string[]
  ): void {
    const matches = this.getAllMatches();
    const normalizedDescription = normalizeTurkish(description);
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Remove any existing match for this description
    const filteredMatches = matches.filter(m => m.normalizedDescription !== normalizedDescription);
    
    const newMatch: ManualMatch = {
      id: matchId,
      normalizedDescription,
      originalDescription: description,
      athleteId,
      athleteName,
      parentName,
      isSiblingPayment,
      siblingIds,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 1,
      confidence: 100
    };
    
    filteredMatches.push(newMatch);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredMatches));
      console.log(`✅ Turkish match saved: "${description}" -> ${athleteName}`);
    } catch (error) {
      console.error('❌ Failed to save Turkish match:', error);
    }
  }
  
  /**
   * Find a previously saved match
   */
  static findMatch(description: string): ManualMatch | null {
    const matches = this.getAllMatches();
    const normalizedDescription = normalizeTurkish(description);
    
    // First try exact match
    let match = matches.find(m => m.normalizedDescription === normalizedDescription);
    
    if (!match) {
      // Try fuzzy matching with high threshold
      for (const savedMatch of matches) {
        const similarity = calculateTurkishSimilarity(normalizedDescription, savedMatch.normalizedDescription);
        if (similarity >= 90) {
          match = savedMatch;
          break;
        }
      }
    }
    
    if (match) {
      // Update usage statistics
      match.lastUsed = new Date().toISOString();
      match.usageCount++;
      this.updateMatch(match);
      
      console.log(`✅ Turkish match found: "${description}" -> ${match.athleteName} (used ${match.usageCount} times)`);
    }
    
    return match;
  }
  
  /**
   * Get all saved matches
   */
  static getAllMatches(): ManualMatch[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to load Turkish matches:', error);
      return [];
    }
  }
  
  /**
   * Update an existing match
   */
  private static updateMatch(updatedMatch: ManualMatch): void {
    const matches = this.getAllMatches();
    const index = matches.findIndex(m => m.id === updatedMatch.id);
    
    if (index >= 0) {
      matches[index] = updatedMatch;
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(matches));
      } catch (error) {
        console.error('❌ Failed to update Turkish match:', error);
      }
    }
  }
  
  /**
   * Remove a match
   */
  static removeMatch(matchId: string): void {
    const matches = this.getAllMatches();
    const filteredMatches = matches.filter(m => m.id !== matchId);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredMatches));
      console.log(`✅ Turkish match removed: ${matchId}`);
    } catch (error) {
      console.error('❌ Failed to remove Turkish match:', error);
    }
  }
  
  /**
   * Clear all matches (for maintenance)
   */
  static clearAllMatches(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ All Turkish matches cleared');
    } catch (error) {
      console.error('❌ Failed to clear Turkish matches:', error);
    }
  }
  
  /**
   * Get statistics about saved matches
   */
  static getStatistics(): {
    totalMatches: number;
    totalUsage: number;
    mostUsedMatch: ManualMatch | null;
    recentMatches: ManualMatch[];
  } {
    const matches = this.getAllMatches();
    
    return {
      totalMatches: matches.length,
      totalUsage: matches.reduce((sum, m) => sum + m.usageCount, 0),
      mostUsedMatch: matches.length > 0 
        ? matches.reduce((prev, current) => prev.usageCount > current.usageCount ? prev : current)
        : null,
      recentMatches: matches
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 10)
    };
  }
  
  /**
   * Auto-learn from successful matches
   */
  static autoLearnMatch(
    description: string,
    athleteId: string,
    athleteName: string,
    parentName: string,
    confidence: number,
    isSiblingPayment: boolean = false,
    siblingIds?: string[]
  ): void {
    // Only auto-learn high confidence matches
    if (confidence >= 85) {
      const existingMatch = this.findMatch(description);
      
      if (!existingMatch) {
        this.saveManualMatch(description, athleteId, athleteName, parentName, isSiblingPayment, siblingIds);
        console.log(`🤖 Auto-learned Turkish match: "${description}" -> ${athleteName} (${confidence}% confidence)`);
      }
    }
  }
}

/**
 * Enhanced matching function that uses Turkish-aware algorithms
 */
export const findTurkishMatches = (
  excelRows: any[],
  athletes: any[]
): any[] => {
  console.log('\n🇹🇷 STARTING TURKISH-AWARE MATCHING PROCESS');
  console.log(`📊 Processing ${excelRows.length} Excel rows against ${athletes.length} athletes`);
  
  // Filter to only active athletes
  const activeAthletes = athletes.filter(athlete => {
    const status = athlete.status?.toLowerCase();
    const isActive = !status || status === 'aktif' || status === 'active';
    return isActive;
  });
  
  console.log(`✅ ACTIVE ATHLETES: ${activeAthletes.length} out of ${athletes.length} total athletes`);
  
  const results: any[] = [];
  
  excelRows.forEach((row, index) => {
    console.log(`\n--- Processing Row ${index + 1}: "${row.description}" ---`);
    
    let bestMatch: any = {
      excelRow: row,
      athleteId: null,
      athleteName: '',
      parentName: '',
      similarity: 0,
      isManual: false,
      isSiblingPayment: false,
      isHistorical: false
    };
    
    // First, check for historical/manual matches
    const historicalMatch = TurkishMatchingMemory.findMatch(row.description);
    
    if (historicalMatch && historicalMatch.athleteId) {
      // Verify historical match is still with an ACTIVE athlete
      const athlete = activeAthletes.find(a => a.id.toString() === historicalMatch.athleteId);
      if (athlete) {
        bestMatch = {
          excelRow: row,
          athleteId: athlete.id.toString(),
          athleteName: `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
          parentName: `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim(),
          similarity: 100,
          isManual: false,
          isHistorical: true,
          isSiblingPayment: historicalMatch.isSiblingPayment || false,
          siblingIds: historicalMatch.siblingIds || []
        };
        
        console.log(`✅ HISTORICAL TURKISH MATCH FOUND (ACTIVE): ${bestMatch.athleteName} for "${row.description}"`);
      } else {
        console.log(`❌ HISTORICAL TURKISH MATCH IGNORED: Athlete no longer active for "${row.description}"`);
      }
    } else {
      // Try to match with ACTIVE athletes using Turkish-aware similarity
      console.log(`🔍 Searching for new Turkish matches among ${activeAthletes.length} ACTIVE athletes...`);
      
      activeAthletes.forEach(athlete => {
        const athleteName = `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim();
        const parentName = `${athlete.parentName || ''} ${athlete.parentSurname || ''}`.trim();
        
        if (!athleteName && !parentName) return;
        
        // Calculate Turkish-aware similarity
        const athleteSimilarity = calculateTurkishSimilarity(row.description, athleteName);
        const parentSimilarity = calculateTurkishSimilarity(row.description, parentName);
        
        const maxSimilarity = Math.max(athleteSimilarity, parentSimilarity);
        
        console.log(`  👤 ${athleteName} (${parentName}): Athlete=${athleteSimilarity}%, Parent=${parentSimilarity}%, Max=${maxSimilarity}%`);
        
        // Turkish-aware threshold: 70% for better accuracy
        if (maxSimilarity >= 70 && maxSimilarity > bestMatch.similarity) {
          bestMatch = {
            excelRow: row,
            athleteId: athlete.id.toString(),
            athleteName: athleteName,
            parentName: parentName,
            similarity: maxSimilarity,
            isManual: false,
            isHistorical: false,
            isSiblingPayment: false
          };
          
          console.log(`  🎯 NEW BEST TURKISH MATCH: ${athleteName} with ${maxSimilarity}%`);
          
          // Auto-learn high confidence matches
          TurkishMatchingMemory.autoLearnMatch(
            row.description,
            athlete.id.toString(),
            athleteName,
            parentName,
            maxSimilarity
          );
        }
      });
    }
    
    // Add confidence warnings
    if (bestMatch.similarity > 0 && bestMatch.similarity < 85 && !bestMatch.isHistorical) {
      console.log(`⚠️  MEDIUM CONFIDENCE TURKISH MATCH: ${bestMatch.athleteName} (${bestMatch.similarity}%) - MANUAL REVIEW RECOMMENDED`);
    }
    
    console.log(`✅ FINAL TURKISH MATCH for "${row.description}": ${bestMatch.athleteName || 'NO MATCH'} (${bestMatch.similarity}%)`);
    results.push(bestMatch);
  });
  
  // Statistics
  const historicalMatches = results.filter(r => r.isHistorical).length;
  const highConfidenceMatches = results.filter(r => r.similarity >= 85 && !r.isHistorical).length;
  const mediumConfidenceMatches = results.filter(r => r.similarity >= 70 && r.similarity < 85).length;
  const lowConfidenceMatches = results.filter(r => r.similarity > 0 && r.similarity < 70).length;
  const noMatches = results.filter(r => r.similarity === 0).length;
  
  console.log(`\n📊 TURKISH MATCHING SUMMARY:`);
  console.log(`  🎯 Historical (Learned): ${historicalMatches}`);
  console.log(`  ✅ High Confidence (85-99%): ${highConfidenceMatches}`);
  console.log(`  ⚠️ Medium Confidence (70-84%): ${mediumConfidenceMatches}`);
  console.log(`  ❓ Low Confidence (<70%): ${lowConfidenceMatches}`);
  console.log(`  ❌ No Match: ${noMatches}`);
  
  return results;
};