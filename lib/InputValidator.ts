// ✅ INPUT VALIDATION & SANITIZATION SERVICE
// Prevents XSS attacks and invalid data entry

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Create a temporary DOM element to safely parse HTML
  const temp = document.createElement('div');
  temp.textContent = html; // textContent prevents HTML parsing
  return temp.innerHTML;
}

/**
 * Sanitize chat message input
 * - Removes excessive whitespace
 * - Prevents XSS via HTML tags
 * - Max length 2000 chars
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') return '';
  
  // Remove script tags and dangerous HTML
  let sanitized = message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
  
  // Limit length
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (Vietnamese)
 * Accepts: 09xx, 08xx, 07xx, 03xx format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(09|08|07|03|01)\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Validate Vietnamese name
 * - No special characters or numbers
 * - Min 2 chars, max 100
 */
export function validateVietnameseName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  
  // Allow Vietnamese characters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-ZÀ-ỿ\s'-]+$/;
  return nameRegex.test(trimmed);
}

/**
 * Sanitize search query
 * - Max 100 chars
 * - Remove special SQL characters
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  let sanitized = query
    .trim()
    .substring(0, 100)
    .replace(/[;'"%\\]/g, ''); // Remove SQL injection chars
  
  return sanitized;
}

/**
 * Validate and parse JSON safely
 */
export function safeParseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate password strength
 * - Min 8 chars
 * - At least 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push('Mật khẩu phải có ít nhất 8 ký tự');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Phải có ít nhất 1 chữ cái viết hoa');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Phải có ít nhất 1 chữ cái viết thường');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Phải có ít nhất 1 số');
  } else {
    score++;
  }

  if (!/[!@#$%^&*]/.test(password)) {
    feedback.push('Phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)');
  } else {
    score++;
  }

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 4) strength = 'good';
  else if (score >= 3) strength = 'fair';

  return {
    isValid: score >= 4,
    strength,
    feedback,
  };
}
