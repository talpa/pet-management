// Demo utility functions for unit testing

export function parseTagsFromString(input: string): string[] {
  if (!input || !input.trim()) {
    return [];
  }
  
  return input
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index); // remove duplicates
}

export function generateSeoUrl(name: string): string {
  if (!name || !name.trim()) {
    return '';
  }
  
  return name
    .toLowerCase()
    .trim()
    // Replace Czech characters
    .replace(/ů/g, 'u')
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüűý]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[čç]/g, 'c')
    .replace(/ď/g, 'd')
    .replace(/ň/g, 'n')
    .replace(/ř/g, 'r')
    .replace(/š/g, 's')
    .replace(/ť/g, 't')
    .replace(/ž/g, 'z')
    // Remove special characters
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

export function validateEmail(email: string): boolean {
  if (!email || !email.trim()) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string, minLength: number = 8): boolean {
  if (!password || password.length < minLength) {
    return false;
  }
  
  // Check for at least one uppercase, lowercase, number, and special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^"'\s>]+/gi, '')
    .trim();
}

export function formatDate(date: Date | null | undefined, format?: string): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return date === null || date === undefined ? '' : 'Invalid Date';
  }
  
  if (format === 'YYYY-MM-DD') {
    return date.toISOString().split('T')[0];
  }
  
  if (format === 'DD/MM/YYYY') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  if (format === 'cs') {
    return date.toLocaleDateString('cs-CZ');
  }
  
  if (format === 'en') {
    return date.toLocaleDateString('en-US');
  }
  
  return date.toLocaleDateString();
}