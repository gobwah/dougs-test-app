/**
 * Normalize a label for comparison
 * Time complexity: O(n) where n is the length of the label
 * Space complexity: O(n) for the new string
 */
export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/g, ' ') // Replace one or more consecutive spaces with a single space
    .replaceAll(/[^\w\s]/g, ''); // Remove all non-alphanumeric characters (punctuation, symbols, etc.)
}

/**
 * Calculate Levenshtein distance between two strings
 * Time complexity: O(m * n) where m and n are the lengths of the strings
 * Space complexity: O(m * n) for the matrix
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

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
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Time complexity: O(m * n) where m and n are the lengths of the strings
 * Space complexity: O(m * n) for the Levenshtein matrix
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Quick check if two labels can potentially be similar based on length
 * For 80% similarity threshold, the longer label must be <= 1.25 * shorter label
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
function canBeSimilarByLength(label1: string, label2: string): boolean {
  const len1 = label1.length;
  const len2 = label2.length;

  if (len1 === 0 || len2 === 0) {
    return len1 === len2;
  }

  const longer = Math.max(len1, len2);
  const shorter = Math.min(len1, len2);

  // For 80% similarity: shorter / longer >= 0.8
  // Therefore: longer <= shorter / 0.8 = shorter * 1.25
  return longer <= shorter * 1.25;
}

/**
 * Quick heuristic check using common characters to avoid expensive Levenshtein
 * If two strings have too few characters in common, they cannot be 80% similar
 * Time complexity: O(m + n) where m and n are the lengths of the strings
 * Space complexity: O(min(m, n)) for character frequency maps
 */
function quickSimilarityCheck(label1: string, label2: string): boolean {
  // Count character frequencies
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();

  for (const char of label1) {
    freq1.set(char, (freq1.get(char) || 0) + 1);
  }
  for (const char of label2) {
    freq2.set(char, (freq2.get(char) || 0) + 1);
  }

  // Count common characters (minimum frequency in both strings)
  let commonChars = 0;
  const allChars = new Set([...freq1.keys(), ...freq2.keys()]);
  for (const char of allChars) {
    const count1 = freq1.get(char) || 0;
    const count2 = freq2.get(char) || 0;
    commonChars += Math.min(count1, count2);
  }

  // For 80% similarity, common characters should be at least 80% of the average length
  const avgLength = (label1.length + label2.length) / 2;
  const minCommonChars = avgLength * 0.8;

  return commonChars >= minCommonChars;
}

/**
 * Check if two labels are similar
 * Time complexity: O(m * n) in worst case (Levenshtein), O(min(m, n)) for contains check
 * Space complexity: O(m * n) in worst case
 */
export function areLabelsSimilar(label1: string, label2: string): boolean {
  if (label1 === label2) {
    return true;
  }

  if (label1.includes(label2) || label2.includes(label1)) {
    return true;
  }

  // Quick length check to avoid expensive Levenshtein calculation
  if (!canBeSimilarByLength(label1, label2)) {
    return false;
  }

  // Quick heuristic check using common characters
  if (!quickSimilarityCheck(label1, label2)) {
    return false;
  }

  const similarity = calculateSimilarity(label1, label2);
  return similarity > 0.8; // 80% similarity threshold
}
