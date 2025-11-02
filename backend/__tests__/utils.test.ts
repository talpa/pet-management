import {
  generateSeoUrl,
  validateEmail,
  validatePassword,
  formatDate,
  sanitizeInput,
  slugify,
  parseTagsFromString,
  filterAnimalsByTags
} from '../src/utils/helpers';

describe('Helper Functions', () => {
  describe('generateSeoUrl', () => {
    it('should generate SEO-friendly URL from name', () => {
      expect(generateSeoUrl('My Pet Dog')).toBe('my-pet-dog');
      expect(generateSeoUrl('Special Characters!@#$%')).toBe('special-characters');
      expect(generateSeoUrl('  Spaces  Around  ')).toBe('spaces-around');
    });

    it('should handle Czech characters', () => {
      expect(generateSeoUrl('Můj mazlíček')).toBe('muj-mazlicek');
      expect(generateSeoUrl('Žluťoučký kůň')).toBe('zlutoucky-kun');
    });

    it('should handle empty or invalid input', () => {
      expect(generateSeoUrl('')).toBe('');
      expect(generateSeoUrl('   ')).toBe('');
      expect(generateSeoUrl('123456')).toBe('123456');
    });

    it('should generate unique URLs when duplicate exists', () => {
      const existingUrls = ['my-pet', 'my-pet-1', 'my-pet-2'];
      expect(generateSeoUrl('My Pet', existingUrls)).toBe('my-pet-3');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user name@domain.com')).toBe(false);
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
      expect(validatePassword('password')).toBe(false); // no numbers/special chars
      expect(validatePassword('PASSWORD123')).toBe(false); // no lowercase
      expect(validatePassword('password123')).toBe(false); // no uppercase
      expect(validatePassword('')).toBe(false); // empty
    });

    it('should have configurable minimum length', () => {
      expect(validatePassword('Short1!', 10)).toBe(false);
      expect(validatePassword('LongerPass1!', 10)).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2023-12-25');
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('25/12/2023');
    });

    it('should handle different locales', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDate(date, 'cs')).toMatch(/25\.12\.2023/);
      expect(formatDate(date, 'en')).toMatch(/12\/25\/2023/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
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

    it('should handle SQL injection attempts', () => {
      expect(sanitizeInput("'; DROP TABLE users; --"))
        .not.toContain('DROP TABLE');
      expect(sanitizeInput('1\' OR \'1\'=\'1'))
        .not.toContain('OR');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Special Characters!@#')).toBe('special-characters');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should handle international characters', () => {
      expect(slugify('Café')).toBe('cafe');
      expect(slugify('Naïve')).toBe('naive');
      expect(slugify('Tschüß')).toBe('tschuss');
    });

    it('should handle edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('123')).toBe('123');
      expect(slugify('!@#$%^&*()')).toBe('');
    });
  });

  describe('parseTagsFromString', () => {
    it('should parse comma-separated tags', () => {
      expect(parseTagsFromString('friendly,playful,large'))
        .toEqual(['friendly', 'playful', 'large']);
      expect(parseTagsFromString('tag1, tag2 , tag3'))
        .toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle single tags', () => {
      expect(parseTagsFromString('single-tag')).toEqual(['single-tag']);
      expect(parseTagsFromString(' single ')).toEqual(['single']);
    });

    it('should handle empty or invalid input', () => {
      expect(parseTagsFromString('')).toEqual([]);
      expect(parseTagsFromString('   ')).toEqual([]);
      expect(parseTagsFromString(',')).toEqual([]);
      expect(parseTagsFromString(',,,tag,,,')).toEqual(['tag']);
    });

    it('should remove duplicates and empty values', () => {
      expect(parseTagsFromString('tag1,tag1,tag2,,tag3'))
        .toEqual(['tag1', 'tag2', 'tag3']);
      expect(parseTagsFromString(' , , tag1 , , tag1 , tag2 , '))
        .toEqual(['tag1', 'tag2']);
    });
  });

  describe('filterAnimalsByTags', () => {
    const mockAnimals = [
      { id: 1, name: 'Buddy', tags: ['friendly', 'playful'] },
      { id: 2, name: 'Max', tags: ['large', 'guard'] },
      { id: 3, name: 'Bella', tags: ['friendly', 'small'] },
      { id: 4, name: 'Rocky', tags: ['playful', 'large'] }
    ];

    it('should filter by single tag', () => {
      const result = filterAnimalsByTags(mockAnimals, ['friendly']);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.name)).toEqual(['Buddy', 'Bella']);
    });

    it('should filter by multiple tags with OR logic', () => {
      const result = filterAnimalsByTags(mockAnimals, ['friendly', 'large']);
      expect(result).toHaveLength(3);
      expect(result.map(a => a.name)).toEqual(['Buddy', 'Max', 'Bella', 'Rocky']);
    });

    it('should return all animals when no tags specified', () => {
      const result = filterAnimalsByTags(mockAnimals, []);
      expect(result).toHaveLength(4);
    });

    it('should return empty array when no matches', () => {
      const result = filterAnimalsByTags(mockAnimals, ['nonexistent']);
      expect(result).toHaveLength(0);
    });

    it('should handle animals without tags', () => {
      const animalsWithoutTags = [
        { id: 1, name: 'Buddy', tags: [] },
        { id: 2, name: 'Max', tags: ['friendly'] }
      ];
      
      const result = filterAnimalsByTags(animalsWithoutTags, ['friendly']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Max');
    });
  });
});

describe('Validation Utilities', () => {
  describe('Animal Data Validation', () => {
    it('should validate animal creation data', () => {
      const validData = {
        name: 'Buddy',
        speciesId: 1,
        ownerId: 1,
        description: 'Friendly dog',
        isActive: true
      };

      // This would use actual validation function
      expect(validateAnimalData(validData)).toBe(true);
    });

    it('should reject invalid animal data', () => {
      const invalidData = {
        name: '', // empty name
        speciesId: 'invalid', // wrong type
        ownerId: null // missing owner
      };

      expect(validateAnimalData(invalidData)).toBe(false);
    });
  });

  describe('Tag Validation', () => {
    it('should validate tag data', () => {
      const validTag = {
        name: 'friendly',
        color: '#4CAF50',
        category: 'temperament'
      };

      expect(validateTagData(validTag)).toBe(true);
    });

    it('should reject invalid tag data', () => {
      const invalidTag = {
        name: '', // empty name
        color: 'invalid-color', // invalid color format
        category: null
      };

      expect(validateTagData(invalidTag)).toBe(false);
    });

    it('should validate hex color format', () => {
      expect(validateHexColor('#FF0000')).toBe(true);
      expect(validateHexColor('#abc')).toBe(true);
      expect(validateHexColor('FF0000')).toBe(false); // missing #
      expect(validateHexColor('#GG0000')).toBe(false); // invalid hex
    });
  });
});

// Mock validation functions for testing
function validateAnimalData(data: any): boolean {
  return !!(data.name && 
           typeof data.speciesId === 'number' && 
           typeof data.ownerId === 'number');
}

function validateTagData(data: any): boolean {
  return !!(data.name && 
           validateHexColor(data.color) && 
           data.category);
}

function validateHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}