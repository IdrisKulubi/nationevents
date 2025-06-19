

const S3_PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";

/**
 * Generate the full S3 URL from a stored CV path
 * @param cvPath - The path stored in database (e.g., "cvs/user-id/filename.pdf")
 * @returns Full S3 URL
 */
export function generateCvUrl(cvPath: string): string {
  if (!cvPath) return '';
  
  // If it's already a full URL, return as is
  if (cvPath.startsWith('http')) {
    return cvPath;
  }
  
  // Removes any leading slash and ensure proper format
  const cleanPath = cvPath.startsWith('/') ? cvPath.slice(1) : cvPath;
  
  return `${S3_PUBLIC_URL}/${cleanPath}`;
}

/**
 * Extract the storage path from a full S3 URL for database storage
 * @param fullUrl - The complete S3 URL
 * @returns Just the path part for database storage
 */
export function extractCvPath(fullUrl: string): string {
  if (!fullUrl) return '';
  
  // If it's already just a path, return as is
  if (!fullUrl.startsWith('http')) {
    return fullUrl;
  }
  
  try {
    const url = new URL(fullUrl);
    return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  } catch (error) {
    console.error('Error extracting CV path:', error);
    return fullUrl; // Fallback to original if URL parsing fails
  }
}

/**
 * Validate if a CV URL/path is properly formatted
 * @param cvPath - The CV path or URL to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidCvPath(cvPath: string): boolean {
  if (!cvPath) return false;
  
  // Should contain 'cvs/' and end with a file extension
  const hasValidStructure = cvPath.includes('cvs/') && 
    (cvPath.endsWith('.pdf') || cvPath.endsWith('.doc') || cvPath.endsWith('.docx'));
  
  return hasValidStructure;
}

/**
 * Generate a proper CV storage path for new uploads
 * @param userId - The user ID
 * @param filename - The original filename
 * @returns Properly formatted storage path
 */
export function generateCvStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
  return `cvs/${userId}/${timestamp}-${cleanFilename}`;
}

/**
 * Open CV in new tab with proper error handling
 * @param cvPath - The CV path from database
 */
export function openCvInNewTab(cvPath: string): void {
  if (!cvPath) {
    console.error('No CV path provided');
    return;
  }
  
  const fullUrl = generateCvUrl(cvPath);
  console.log('Opening CV URL:', fullUrl);
  
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
} 