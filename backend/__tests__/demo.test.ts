import { parseTagsFromString, generateSeoUrl, validateEmail, validatePassword, sanitizeInput, formatDate } from './demoUtils';

describe('Demo Unit Tests - Business Logic', () => {
  describe('parseTagsFromString', () => {
    it('should parse comma-separated tags', () => {
      expect(parseTagsFromString('friendly,playful,large'))
        .toEqual(['friendly', 'playful', 'large']);
    });

    it('should handle spaces around tags', () => {
      expect(parseTagsFromString('tag1, tag2 , tag3'))
        .toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle empty input', () => {
      expect(parseTagsFromString('')).toEqual([]);
      expect(parseTagsFromString('   ')).toEqual([]);
    });

    it('should remove duplicates', () => {
      expect(parseTagsFromString('tag1,tag1,tag2'))
        .toEqual(['tag1', 'tag2']);
    });

    it('should filter out empty tags', () => {
      expect(parseTagsFromString('tag1,,tag2,'))
        .toEqual(['tag1', 'tag2']);
    });
  });

  describe('generateSeoUrl', () => {
    it('should generate SEO-friendly URLs', () => {
      expect(generateSeoUrl('My Pet Dog')).toBe('my-pet-dog');
      expect(generateSeoUrl('Special Characters!@#$%')).toBe('special-characters');
    });

    it('should handle Czech characters', () => {
      expect(generateSeoUrl('Můj mazlíček')).toBe('muj-mazlicek');
      expect(generateSeoUrl('Žluťoučký kůň')).toBe('zlutoucku-kun');
    });

    it('should handle empty input', () => {
      expect(generateSeoUrl('')).toBe('');
      expect(generateSeoUrl('   ')).toBe('');
    });

    it('should handle multiple spaces', () => {
      expect(generateSeoUrl('Multiple   Spaces   Here')).toBe('multiple-spaces-here');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(generateSeoUrl('!@#$%Pet Name*&^')).toBe('pet-name');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user name@domain.com')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
      expect(validateEmail('   ')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('AnotherGood1@')).toBe(true);
      expect(validatePassword('ValidPassword2#')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('123')).toBe(false); // too short
      expect(validatePassword('password')).toBe(false); // no numbers/special chars/uppercase
      expect(validatePassword('PASSWORD123')).toBe(false); // no lowercase/special chars
      expect(validatePassword('password123')).toBe(false); // no uppercase/special chars
      expect(validatePassword('Password123')).toBe(false); // no special chars
      expect(validatePassword('')).toBe(false); // empty
    });

    it('should respect custom minimum length', () => {
      expect(validatePassword('Short1!', 10)).toBe(false);
      expect(validatePassword('LongerPass1!', 10)).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove harmful HTML and scripts', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello'))
        .toBe('Hello');
      expect(sanitizeInput('<img src="x" onerror="alert(1)">'))
        .toBe('');
      expect(sanitizeInput('Normal text <b>bold</b>'))
        .toBe('Normal text bold');
    });

    it('should preserve safe content', () => {
      expect(sanitizeInput('Hello World!')).toBe('Hello World!');
      expect(sanitizeInput('Email: test@example.com')).toBe('Email: test@example.com');
      expect(sanitizeInput('Price: $19.99')).toBe('Price: $19.99');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should remove javascript protocols', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('JavaScript:void(0)')).toBe('void(0)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick="alert(1)"')).toBe('');
      expect(sanitizeInput('onload="malicious()"')).toBe('');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2023-12-25T10:30:00Z');

    it('should format dates correctly', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2023-12-25');
      expect(formatDate(testDate, 'DD/MM/YYYY')).toBe('25/12/2023');
    });

    it('should handle different locales', () => {
      const csFormat = formatDate(testDate, 'cs');
      const enFormat = formatDate(testDate, 'en');
      
      expect(csFormat).toContain('25');
      expect(csFormat).toContain('12');
      expect(csFormat).toContain('2023');
      
      expect(enFormat).toContain('25');
      expect(enFormat).toContain('12');
      expect(enFormat).toContain('2023');
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });

    it('should use default locale when no format specified', () => {
      const defaultFormat = formatDate(testDate);
      expect(typeof defaultFormat).toBe('string');
      expect(defaultFormat.length).toBeGreaterThan(0);
    });
  });
});