import request from 'supertest';
import { sequelize } from '../src/config/database';
import AnimalTag from '../src/models/AnimalTag';
import Animal from '../src/models/Animal';
import AnimalSpecies from '../src/models/AnimalSpecies';
import User from '../src/models/User';

// Import express app
let app: any;

describe('Tag API Endpoints', () => {
  beforeAll(async () => {
    // Setup test database
    await sequelize.sync({ force: true });
    
    // Import app after DB setup
    app = require('../src/server').default;
    
    // Create test data
    await AnimalSpecies.create({
      id: 1,
      name: 'Dog',
      nameCs: 'Pes',
      icon: '🐕'
    });
    
    await User.create({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hash',
      role: 'user'
    });
    
    // Create test tags
    await AnimalTag.bulkCreate([
      { id: 1, name: 'friendly', color: '#4CAF50', category: 'temperament' },
      { id: 2, name: 'playful', color: '#2196F3', category: 'temperament' },
      { id: 3, name: 'large', color: '#FF9800', category: 'size' },
      { id: 4, name: 'small', color: '#9C27B0', category: 'size' }
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/tags', () => {
    it('should return all tags', async () => {
      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(4);
      
      const tag = response.body.data.find((t: any) => t.name === 'friendly');
      expect(tag).toMatchObject({
        name: 'friendly',
        color: '#4CAF50',
        category: 'temperament'
      });
    });

    it('should filter tags by category', async () => {
      const response = await request(app)
        .get('/api/tags?category=size')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((tag: any) => tag.category === 'size')).toBe(true);
    });

    it('should search tags by name', async () => {
      const response = await request(app)
        .get('/api/tags?search=play')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('playful');
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag', async () => {
      const newTag = {
        name: 'energetic',
        color: '#FF5722',
        category: 'temperament'
      };

      const response = await request(app)
        .post('/api/tags')
        .send(newTag)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'energetic',
        color: '#FF5722',
        category: 'temperament'
      });
      expect(response.body).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const incompleteTag = {
        color: '#FF5722'
        // missing name and category
      };

      await request(app)
        .post('/api/tags')
        .send(incompleteTag)
        .expect(400);
    });

    it('should prevent duplicate tag names', async () => {
      const duplicateTag = {
        name: 'friendly', // already exists
        color: '#000000',
        category: 'temperament'
      };

      await request(app)
        .post('/api/tags')
        .send(duplicateTag)
        .expect(400);
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update an existing tag', async () => {
      const updates = {
        color: '#E91E63',
        category: 'behavior'
      };

      const response = await request(app)
        .put('/api/tags/1')
        .send(updates)
        .expect(200);

      expect(response.body.color).toBe('#E91E63');
      expect(response.body.category).toBe('behavior');
      expect(response.body.name).toBe('friendly'); // unchanged
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app)
        .put('/api/tags/999')
        .send({ color: '#000000' })
        .expect(404);
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete a tag', async () => {
      await request(app)
        .delete('/api/tags/4')
        .expect(200);

      // Verify tag is deleted
      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      const deletedTag = response.body.data.find((t: any) => t.id === 4);
      expect(deletedTag).toBeUndefined();
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app)
        .delete('/api/tags/999')
        .expect(404);
    });
  });
});

describe('Tag Filtering Logic', () => {
  beforeAll(async () => {
    app = require('../src/server').default;
    
    // Create test animal with tags
    const animal = await Animal.create({
      id: 1,
      name: 'Buddy',
      speciesId: 1,
      ownerId: 1,
      seoUrl: 'buddy'
    });

    // Associate tags with animal
    await animal.setTags([1, 2]); // friendly, playful
  });

  describe('GET /api/animals with tag filtering', () => {
    it('should filter animals by single tag', async () => {
      const response = await request(app)
        .get('/api/animals?tags=friendly')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Buddy');
    });

    it('should filter animals by multiple tags (OR logic)', async () => {
      const response = await request(app)
        .get('/api/animals?tags=friendly,large')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Buddy');
    });

    it('should return empty result for non-matching tags', async () => {
      const response = await request(app)
        .get('/api/animals?tags=aggressive')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle malformed tag parameters', async () => {
      const response = await request(app)
        .get('/api/animals?tags=')
        .expect(200);

      // Should return all animals when tags parameter is empty
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});