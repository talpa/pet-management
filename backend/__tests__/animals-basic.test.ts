import request from 'supertest';
import { sequelize } from '../src/config/database';
import Animal from '../src/models/Animal';
import AnimalSpecies from '../src/models/AnimalSpecies';
import { User } from '../src/models/User';
import AnimalTag from '../src/models/AnimalTag';

let app: any;

describe('Animal CRUD Operations - Basic Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    app = require('../src/server').default;
    
    // Create test data
    await AnimalSpecies.bulkCreate([
      { id: 1, name: 'Dog', isActive: true },
      { id: 2, name: 'Cat', isActive: true }
    ]);
    
    await User.bulkCreate([
      { id: 1, name: 'User 1', email: 'user1@test.com', password: 'hash', role: 'user', status: 'active' },
      { id: 2, name: 'Admin', email: 'admin@test.com', password: 'hash', role: 'admin', status: 'active' }
    ]);
    
    await AnimalTag.bulkCreate([
      { id: 1, name: 'friendly', color: '#4CAF50', isActive: true },
      { id: 2, name: 'large', color: '#FF9800', isActive: true }
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/animals', () => {
    beforeEach(async () => {
      await Animal.destroy({ where: {} });
      
      // Create test animals
      await Animal.bulkCreate([
        {
          id: 1,
          name: 'Buddy',
          description: 'Friendly dog',
          speciesId: 1,
          ownerId: 1,
          seoUrl: 'buddy',
          isActive: true
        },
        {
          id: 2,
          name: 'Whiskers',
          description: 'Playful cat',
          speciesId: 2,
          ownerId: 2,
          seoUrl: 'whiskers',
          isActive: true
        }
      ]);
    });

    it('should return all animals', async () => {
      const response = await request(app)
        .get('/api/animals')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Buddy');
    });

    it('should filter by species', async () => {
      const response = await request(app)
        .get('/api/animals?speciesId=2')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Whiskers');
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/animals?search=Buddy')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Buddy');
    });
  });

  describe('GET /api/animals/:id', () => {
    let animalId: number;

    beforeEach(async () => {
      const animal = await Animal.create({
        name: 'Test Animal',
        description: 'Test description',
        speciesId: 1,
        ownerId: 1,
        seoUrl: 'test-animal',
        isActive: true
      });
      animalId = animal.id;
    });

    it('should return animal by ID', async () => {
      const response = await request(app)
        .get(`/api/animals/${animalId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Test Animal',
        description: 'Test description'
      });
    });

    it('should return 404 for non-existent animal', async () => {
      await request(app)
        .get('/api/animals/999')
        .expect(404);
    });
  });

  describe('POST /api/animals', () => {
    const validAnimalData = {
      name: 'New Pet',
      description: 'A new pet',
      speciesId: 1,
      ownerId: 1,
      isActive: true
    };

    it('should create a new animal', async () => {
      const response = await request(app)
        .post('/api/animals')
        .send(validAnimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'New Pet',
        description: 'A new pet',
        seoUrl: 'new-pet'
      });

      expect(response.body.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        description: 'Missing name',
        // missing required fields
      };

      await request(app)
        .post('/api/animals')
        .send(incompleteData)
        .expect(400);
    });

    it('should generate unique seoUrl', async () => {
      // Create first animal
      await request(app)
        .post('/api/animals')
        .send({ ...validAnimalData, name: 'Duplicate Name' })
        .expect(201);

      // Create second animal with same name
      const response = await request(app)
        .post('/api/animals')
        .send({ ...validAnimalData, name: 'Duplicate Name' })
        .expect(201);

      expect(response.body.seoUrl).not.toBe('duplicate-name');
      expect(response.body.seoUrl).toMatch(/duplicate-name-\d+/);
    });
  });

  describe('PUT /api/animals/:id', () => {
    let animalId: number;

    beforeEach(async () => {
      const animal = await Animal.create({
        name: 'Original Name',
        description: 'Original description',
        speciesId: 1,
        ownerId: 1,
        seoUrl: 'original',
        isActive: true
      });
      animalId = animal.id;
    });

    it('should update animal data', async () => {
      const updates = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/animals/${animalId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject(updates);
    });

    it('should return 404 for non-existent animal', async () => {
      await request(app)
        .put('/api/animals/999')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/animals/:id', () => {
    let animalId: number;

    beforeEach(async () => {
      const animal = await Animal.create({
        name: 'To Delete',
        speciesId: 1,
        ownerId: 1,
        seoUrl: 'to-delete',
        isActive: true
      });
      animalId = animal.id;
    });

    it('should delete an animal', async () => {
      await request(app)
        .delete(`/api/animals/${animalId}`)
        .expect(200);

      // Verify animal is deleted
      const animal = await Animal.findByPk(animalId);
      expect(animal).toBeNull();
    });

    it('should return 404 for non-existent animal', async () => {
      await request(app)
        .delete('/api/animals/999')
        .expect(404);
    });
  });
});