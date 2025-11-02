import request from 'supertest';
import { sequelize } from '../src/config/database';
import Animal from '../src/models/Animal';
import AnimalSpecies from '../src/models/AnimalSpecies';
import User from '../src/models/User';
import AnimalTag from '../src/models/AnimalTag';

let app: any;

describe('Animal CRUD Operations', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    app = require('../src/server').default;
    
    // Create test data
    await AnimalSpecies.bulkCreate([
      { id: 1, name: 'Dog', nameCs: 'Pes', icon: '🐕' },
      { id: 2, name: 'Cat', nameCs: 'Kočka', icon: '🐱' }
    ]);
    
    await User.bulkCreate([
      { id: 1, username: 'testuser1', email: 'user1@test.com', passwordHash: 'hash', role: 'user' },
      { id: 2, username: 'admin', email: 'admin@test.com', passwordHash: 'hash', role: 'admin' }
    ]);
    
    await AnimalTag.bulkCreate([
      { id: 1, name: 'friendly', color: '#4CAF50', category: 'temperament' },
      { id: 2, name: 'large', color: '#FF9800', category: 'size' }
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
          age: 3,
          gender: 'male',
          description: 'Friendly dog',
          speciesId: 1,
          ownerId: 1,
          seoUrl: 'buddy',
          isPublic: true
        },
        {
          id: 2,
          name: 'Whiskers',
          age: 2,
          gender: 'female',
          description: 'Playful cat',
          speciesId: 2,
          ownerId: 2,
          seoUrl: 'whiskers',
          isPublic: false
        }
      ]);
    });

    it('should return all public animals for non-authenticated user', async () => {
      const response = await request(app)
        .get('/api/animals')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Buddy');
      expect(response.body.data[0].isPublic).toBe(true);
    });

    it('should filter by species', async () => {
      await Animal.update({ isPublic: true }, { where: { id: 2 } });
      
      const response = await request(app)
        .get('/api/animals?speciesId=2')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Whiskers');
    });

    it('should filter by gender', async () => {
      const response = await request(app)
        .get('/api/animals?gender=male')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].gender).toBe('male');
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/animals?search=Buddy')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Buddy');
    });

    it('should paginate results', async () => {
      // Create more animals for pagination test
      const animals = Array.from({ length: 15 }, (_, i) => ({
        name: `Animal${i}`,
        age: 1,
        gender: 'male',
        speciesId: 1,
        ownerId: 1,
        seoUrl: `animal-${i}`,
        isPublic: true
      }));
      
      await Animal.bulkCreate(animals);

      const response = await request(app)
        .get('/api/animals?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        totalPages: expect.any(Number),
        totalItems: expect.any(Number),
        itemsPerPage: 10
      });
    });
  });

  describe('GET /api/animals/:id', () => {
    let animalId: number;

    beforeEach(async () => {
      const animal = await Animal.create({
        name: 'Test Animal',
        age: 2,
        gender: 'male',
        description: 'Test description',
        speciesId: 1,
        ownerId: 1,
        seoUrl: 'test-animal',
        isPublic: true
      });
      animalId = animal.id;
    });

    it('should return animal by ID', async () => {
      const response = await request(app)
        .get(`/api/animals/${animalId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Test Animal',
        age: 2,
        gender: 'male',
        description: 'Test description'
      });
    });

    it('should return 404 for non-existent animal', async () => {
      await request(app)
        .get('/api/animals/999')
        .expect(404);
    });

    it('should include species and owner information', async () => {
      const response = await request(app)
        .get(`/api/animals/${animalId}`)
        .expect(200);

      expect(response.body.species).toBeDefined();
      expect(response.body.owner).toBeDefined();
      expect(response.body.species.name).toBe('Dog');
      expect(response.body.owner.username).toBe('testuser1');
    });
  });

  describe('POST /api/animals', () => {
    const validAnimalData = {
      name: 'New Pet',
      age: 1,
      gender: 'female',
      description: 'A new pet',
      speciesId: 1,
      ownerId: 1,
      isPublic: true,
      tagIds: [1, 2]
    };

    it('should create a new animal', async () => {
      const response = await request(app)
        .post('/api/animals')
        .send(validAnimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'New Pet',
        age: 1,
        gender: 'female',
        description: 'A new pet',
        seoUrl: 'new-pet'
      });

      expect(response.body.id).toBeDefined();
    });

    it('should associate tags with animal', async () => {
      const response = await request(app)
        .post('/api/animals')
        .send(validAnimalData)
        .expect(201);

      const animalId = response.body.id;
      
      // Check if tags are associated
      const animal = await Animal.findByPk(animalId, {
        include: ['tags']
      });

      expect(animal?.tags).toHaveLength(2);
      expect(animal?.tags?.map(t => t.id)).toEqual(expect.arrayContaining([1, 2]));
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        age: 1,
        // missing required fields
      };

      await request(app)
        .post('/api/animals')
        .send(incompleteData)
        .expect(400);
    });

    it('should validate age is positive', async () => {
      const invalidData = {
        ...validAnimalData,
        age: -1
      };

      await request(app)
        .post('/api/animals')
        .send(invalidData)
        .expect(400);
    });

    it('should validate gender values', async () => {
      const invalidData = {
        ...validAnimalData,
        gender: 'invalid'
      };

      await request(app)
        .post('/api/animals')
        .send(invalidData)
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
        age: 2,
        gender: 'male',
        description: 'Original description',
        speciesId: 1,
        ownerId: 1,
        seoUrl: 'original',
        isPublic: true
      });
      animalId = animal.id;
    });

    it('should update animal data', async () => {
      const updates = {
        name: 'Updated Name',
        age: 3,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/animals/${animalId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject(updates);
    });

    it('should update animal tags', async () => {
      const updates = {
        tagIds: [1]
      };

      await request(app)
        .put(`/api/animals/${animalId}`)
        .send(updates)
        .expect(200);

      const animal = await Animal.findByPk(animalId, {
        include: ['tags']
      });

      expect(animal?.tags).toHaveLength(1);
      expect(animal?.tags?.[0].id).toBe(1);
    });

    it('should return 404 for non-existent animal', async () => {
      await request(app)
        .put('/api/animals/999')
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should validate update data', async () => {
      const invalidUpdates = {
        age: -5
      };

      await request(app)
        .put(`/api/animals/${animalId}`)
        .send(invalidUpdates)
        .expect(400);
    });
  });

  describe('DELETE /api/animals/:id', () => {
    let animalId: number;

    beforeEach(async () => {
      const animal = await Animal.create({
        name: 'To Delete',
        age: 1,
        gender: 'male',
        speciesId: 1,
        ownerId: 1,
        seoUrl: 'to-delete',
        isPublic: true
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

    it('should remove tag associations when deleting animal', async () => {
      // Associate tags first
      const animal = await Animal.findByPk(animalId);
      await animal?.setTags([1, 2]);

      // Delete animal
      await request(app)
        .delete(`/api/animals/${animalId}`)
        .expect(200);

      // Verify tag associations are removed
      const { AnimalTagAssignment } = require('../src/models/AnimalTagAssignment');
      const associations = await AnimalTagAssignment.findAll({
        where: { animalId }
      });

      expect(associations).toHaveLength(0);
    });
  });
});