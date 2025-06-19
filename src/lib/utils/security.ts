/**
 * Generate a secure 6-digit PIN for job seeker verification
 */
export function generateSecurePin(): string {
  // Use Web Crypto API instead of Node.js crypto
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomNumber = array[0];
  
  // Convert to 6-digit PIN (100000-999999)
  const pin = (randomNumber % 900000 + 100000).toString();
  
  return pin;
}

/**
 * Generate a unique ticket number for job seekers
 * Format: HCS-YYYY-XXXXXXXX (HCS = Huawei Career Summit)
 */
export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomNumber = array[0];
  
  // Convert to 8-digit number
  const ticketSuffix = (randomNumber % 100000000).toString().padStart(8, "0");
  
  return `HCS-${year}-${ticketSuffix}`;
}

/**
 * Validate PIN format (6 digits)
 */
export function validatePinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/**
 * Validate ticket number format
 */
export function validateTicketNumberFormat(ticketNumber: string): boolean {
  return /^HCS-\d{4}-\d{8}$/.test(ticketNumber);
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a PIN for secure storage using Web Crypto API
 */
export async function hashPin(pin: string, salt?: string): Promise<string> {
  const actualSalt = salt || generateSessionToken().substring(0, 32);
  
  // Encode the PIN and salt
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin + actualSalt);
  
  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', pinData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${actualSalt}:${hashHex}`;
}

/**
 * Verify a hashed PIN using Web Crypto API
 */
export async function verifyHashedPin(pin: string, hashedPin: string): Promise<boolean> {
  try {
    const [salt, hash] = hashedPin.split(":");
    const verifyHash = await hashPin(pin, salt);
    const [, verifyHashValue] = verifyHash.split(":");
    return hash === verifyHashValue;
  } catch (error) {
    return false;
  }
}

/**
 * Generate QR code data for check-in
 */
export function generateQRCodeData(ticketNumber: string, pin: string): string {
  const timestamp = Date.now();
  const data = {
    ticketNumber,
    pin,
    timestamp,
    event: "HCS2025",
  };
  
  return JSON.stringify(data);
}

/**
 * Validate QR code data
 */
export function validateQRCodeData(qrData: string): {
  valid: boolean;
  data?: any;
  error?: string;
} {
  try {
    const parsed = JSON.parse(qrData);
    
    if (!parsed.ticketNumber || !parsed.pin || !parsed.timestamp || !parsed.event) {
      return {
        valid: false,
        error: "Invalid QR code format",
      };
    }
    
    if (parsed.event !== "HCS2025") {
      return {
        valid: false,
        error: "Invalid event code",
      };
    }
    
    // Check if QR code is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - parsed.timestamp > maxAge) {
      return {
        valid: false,
        error: "QR code has expired",
      };
    }
    
    return {
      valid: true,
      data: parsed,
    };
    
  } catch (error) {
    return {
      valid: false,
      error: "Invalid QR code data",
    };
  }
} 