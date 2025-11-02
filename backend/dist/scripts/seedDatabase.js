"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAndSeedDatabase = clearAndSeedDatabase;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const AnimalSpecies_1 = __importDefault(require("../models/AnimalSpecies"));
const SpeciesProperty_1 = __importDefault(require("../models/SpeciesProperty"));
const Animal_1 = __importDefault(require("../models/Animal"));
const AnimalProperty_1 = __importDefault(require("../models/AnimalProperty"));
const AnimalImage_1 = __importDefault(require("../models/AnimalImage"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function clearAndSeedDatabase() {
    try {
        console.log('🚀 Začínám vyčišťování a naplňování databáze...');
        console.log('🧹 Vyčišťuji databázi...');
        await AnimalImage_1.default.destroy({ where: {}, force: true });
        await AnimalProperty_1.default.destroy({ where: {}, force: true });
        await Animal_1.default.destroy({ where: {}, force: true });
        await SpeciesProperty_1.default.destroy({ where: {}, force: true });
        await AnimalSpecies_1.default.destroy({ where: {}, force: true });
        await User_1.User.destroy({ where: {}, force: true });
        await database_1.sequelize.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        await database_1.sequelize.query('ALTER SEQUENCE animal_species_id_seq RESTART WITH 1');
        await database_1.sequelize.query('ALTER SEQUENCE species_properties_id_seq RESTART WITH 1');
        await database_1.sequelize.query('ALTER SEQUENCE animals_id_seq RESTART WITH 1');
        await database_1.sequelize.query('ALTER SEQUENCE animal_properties_id_seq RESTART WITH 1');
        await database_1.sequelize.query('ALTER SEQUENCE animal_images_id_seq RESTART WITH 1');
        console.log('✅ Databáze vyčištěna');
        console.log('👥 Vytvářím testovací uživatele...');
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const users = await User_1.User.bulkCreate([
            {
                name: 'Admin User',
                email: 'admin@petmanagement.cz',
                password: hashedPassword,
                role: 'admin',
                status: 'active',
                provider: 'local',
                company: 'Pet Management s.r.o.'
            },
            {
                name: 'Jana Novakova',
                email: 'jana.novakova@email.cz',
                password: hashedPassword,
                role: 'user',
                status: 'active',
                provider: 'local',
                phone: '+420 123 456 789',
                company: 'Veterinární klinika Praha'
            },
            {
                name: 'Pavel Svoboda',
                email: 'pavel.svoboda@gmail.com',
                role: 'user',
                status: 'active',
                provider: 'google',
                providerId: 'google_123456',
                avatar: 'https://via.placeholder.com/150?text=PS',
                phone: '+420 987 654 321'
            },
            {
                name: 'Marie Dvořáková',
                email: 'marie.dvorakova@email.cz',
                password: hashedPassword,
                role: 'user',
                status: 'active',
                provider: 'local',
                phone: '+420 555 666 777',
                company: 'Chovatelská stanice Dvořák'
            },
            {
                name: 'Tomáš Procházka',
                email: 'tomas.prochazka@email.cz',
                password: hashedPassword,
                role: 'user',
                status: 'active',
                provider: 'local',
                phone: '+420 444 333 222'
            }
        ]);
        console.log(`✅ Vytvořeno ${users.length} uživatelů`);
        console.log('🐕 Vytvářím druhy zvířat...');
        const species = await AnimalSpecies_1.default.bulkCreate([
            {
                name: 'Pes domácí',
                scientificName: 'Canis lupus familiaris',
                description: 'Domestikovaný druh šelmy z čeledi psovitých',
                category: 'Savec',
                isActive: true
            },
            {
                name: 'Kočka domácí',
                scientificName: 'Felis catus',
                description: 'Domestikovaný druh šelmy z čeledi kočkovitých',
                category: 'Savec',
                isActive: true
            },
            {
                name: 'Králík domácí',
                scientificName: 'Oryctolagus cuniculus',
                description: 'Domestikovaný druh z čeledi zajícovitých',
                category: 'Savec',
                isActive: true
            },
            {
                name: 'Andulka vlnkovaná',
                scientificName: 'Melopsittacus undulatus',
                description: 'Malý papoušek původem z Austrálie',
                category: 'Pták',
                isActive: true
            },
            {
                name: 'Morče domácí',
                scientificName: 'Cavia porcellus',
                description: 'Domestikovaný hlodavec z čeledi prasátkovitých',
                category: 'Savec',
                isActive: true
            },
            {
                name: 'Křeček zlatý',
                scientificName: 'Mesocricetus auratus',
                description: 'Malý hlodavec původem ze Sýrie',
                category: 'Savec',
                isActive: true
            },
            {
                name: 'Akvarijní rybka',
                scientificName: 'Poecilia reticulata',
                description: 'Gupka - oblíbená akvarijní rybka',
                category: 'Ryba',
                isActive: true
            },
            {
                name: 'Želva nádherná',
                scientificName: 'Trachemys scripta elegans',
                description: 'Vodní želva původem ze severní Ameriky',
                category: 'Plaz',
                isActive: true
            }
        ]);
        console.log(`✅ Vytvořeno ${species.length} druhů zvířat`);
        console.log('📋 Vytvářím vlastnosti pro druhy zvířat...');
        const speciesProperties = [];
        speciesProperties.push({ speciesId: 1, propertyName: 'Plemeno', propertyType: 'text', isRequired: false, displayOrder: 1 }, { speciesId: 1, propertyName: 'Výška', propertyType: 'number', propertyUnit: 'cm', isRequired: false, displayOrder: 2 }, { speciesId: 1, propertyName: 'Váha', propertyType: 'number', propertyUnit: 'kg', isRequired: false, displayOrder: 3 }, { speciesId: 1, propertyName: 'Barva srsti', propertyType: 'text', isRequired: false, displayOrder: 4 }, { speciesId: 1, propertyName: 'Očkování', propertyType: 'boolean', defaultValue: 'false', isRequired: false, displayOrder: 5 }, { speciesId: 1, propertyName: 'Čip', propertyType: 'text', isRequired: false, displayOrder: 6 });
        speciesProperties.push({ speciesId: 2, propertyName: 'Plemeno', propertyType: 'text', isRequired: false, displayOrder: 1 }, { speciesId: 2, propertyName: 'Váha', propertyType: 'number', propertyUnit: 'kg', isRequired: false, displayOrder: 2 }, { speciesId: 2, propertyName: 'Barva srsti', propertyType: 'text', isRequired: false, displayOrder: 3 }, { speciesId: 2, propertyName: 'Délka srsti', propertyType: 'select', defaultValue: 'krátká|střední|dlouhá', isRequired: false, displayOrder: 4 }, { speciesId: 2, propertyName: 'Očkování', propertyType: 'boolean', defaultValue: 'false', isRequired: false, displayOrder: 5 }, { speciesId: 2, propertyName: 'Kastrace/sterilizace', propertyType: 'boolean', defaultValue: 'false', isRequired: false, displayOrder: 6 });
        speciesProperties.push({ speciesId: 3, propertyName: 'Plemeno', propertyType: 'text', isRequired: false, displayOrder: 1 }, { speciesId: 3, propertyName: 'Váha', propertyType: 'number', propertyUnit: 'kg', isRequired: false, displayOrder: 2 }, { speciesId: 3, propertyName: 'Barva srsti', propertyType: 'text', isRequired: false, displayOrder: 3 }, { speciesId: 3, propertyName: 'Typ uší', propertyType: 'select', defaultValue: 'vzpřímené|lop', isRequired: false, displayOrder: 4 });
        speciesProperties.push({ speciesId: 4, propertyName: 'Barevná mutace', propertyType: 'text', isRequired: false, displayOrder: 1 }, { speciesId: 4, propertyName: 'Umí mluvit', propertyType: 'boolean', defaultValue: 'false', isRequired: false, displayOrder: 2 }, { speciesId: 4, propertyName: 'Kroužek', propertyType: 'text', isRequired: false, displayOrder: 3 });
        speciesProperties.push({ speciesId: 5, propertyName: 'Plemeno', propertyType: 'text', isRequired: false, displayOrder: 1 }, { speciesId: 5, propertyName: 'Váha', propertyType: 'number', propertyUnit: 'g', isRequired: false, displayOrder: 2 }, { speciesId: 5, propertyName: 'Barva srsti', propertyType: 'text', isRequired: false, displayOrder: 3 });
        speciesProperties.push({ speciesId: 6, propertyName: 'Váha', propertyType: 'number', propertyUnit: 'g', isRequired: false, displayOrder: 1 }, { speciesId: 6, propertyName: 'Barva', propertyType: 'text', isRequired: false, displayOrder: 2 });
        speciesProperties.push({ speciesId: 7, propertyName: 'Velikost akvária', propertyType: 'number', propertyUnit: 'l', isRequired: false, displayOrder: 1 }, { speciesId: 7, propertyName: 'Teplota vody', propertyType: 'number', propertyUnit: '°C', isRequired: false, displayOrder: 2 }, { speciesId: 7, propertyName: 'pH vody', propertyType: 'number', isRequired: false, displayOrder: 3 });
        speciesProperties.push({ speciesId: 8, propertyName: 'Velikost krunýře', propertyType: 'number', propertyUnit: 'cm', isRequired: false, displayOrder: 1 }, { speciesId: 8, propertyName: 'Váha', propertyType: 'number', propertyUnit: 'kg', isRequired: false, displayOrder: 2 }, { speciesId: 8, propertyName: 'Typ prostředí', propertyType: 'select', defaultValue: 'vodní|suchozemské|polosuchozemské', isRequired: false, displayOrder: 3 });
        await SpeciesProperty_1.default.bulkCreate(speciesProperties);
        console.log(`✅ Vytvořeno ${speciesProperties.length} vlastností druhů`);
        console.log('🐾 Vytvářím testovací zvířata...');
        const animals = await Animal_1.default.bulkCreate([
            {
                name: 'Rex',
                speciesId: 1,
                ownerId: 2,
                birthDate: new Date('2020-03-15'),
                gender: 'samec',
                description: 'Nádherný německý ovčák, velmi přátelský a poslušný. Miluje dlouhé procházky a hraní si s míčem. Je to skvělý hlídač a nejlepší přítel celé rodiny.',
                seoUrl: 'rex-nemecky-ovcak',
                isActive: true,
                createdBy: 2
            },
            {
                name: 'Bella',
                speciesId: 1,
                ownerId: 3,
                birthDate: new Date('2021-07-20'),
                gender: 'samice',
                description: 'Krásná zlatá retrívr, velmi milá a energická. Zbožňuje vodu a aportování. Je skvělá s dětmi a má nekonečnou trpělivost.',
                seoUrl: 'bella-zlaty-retrivr',
                isActive: true,
                createdBy: 3
            },
            {
                name: 'Max',
                speciesId: 1,
                ownerId: 4,
                birthDate: new Date('2019-11-08'),
                gender: 'samec',
                description: 'Statný rottweiler s obrovským srdcem. Vypadá jako drsňák, ale je to největší mazlíček. Skvělý hlídač a ochránce rodiny.',
                seoUrl: 'max-rottweiler',
                isActive: true,
                createdBy: 4
            },
            {
                name: 'Luna',
                speciesId: 2,
                ownerId: 2,
                birthDate: new Date('2021-05-12'),
                gender: 'samice',
                description: 'Elegantní perská kočka s dlouhým hedvábným kožíškem. Velmi klidná a majestátní. Miluje pohlazení a spaní na slunečním parapetu.',
                seoUrl: 'luna-perska-kocka',
                isActive: true,
                createdBy: 2
            },
            {
                name: 'Whiskers',
                speciesId: 2,
                ownerId: 5,
                birthDate: new Date('2020-09-03'),
                gender: 'samec',
                description: 'Hravý mainský mýval s impozantní velikostí a krásným kožíškem. Velmi inteligentní a sociální kočka, která si rozumí i se psy.',
                seoUrl: 'whiskers-mainsky-myval',
                isActive: true,
                createdBy: 5
            },
            {
                name: 'Bobík',
                speciesId: 3,
                ownerId: 3,
                birthDate: new Date('2022-01-15'),
                gender: 'samec',
                description: 'Roztomilý lop králík s dlouhýma ušima. Velmi klidný a přátelský. Miluje mrkev a petržel, rád poskakuje po zahradě.',
                seoUrl: 'bobik-lop-kralik',
                isActive: true,
                createdBy: 3
            },
            {
                name: 'Sněhurka',
                speciesId: 3,
                ownerId: 4,
                birthDate: new Date('2021-12-20'),
                gender: 'samice',
                description: 'Krásná bílá králice s růžovýma očima. Velmi něžná a klidná, skvělá pro děti. Má nejjemnější kožíšek a miluje hlazení.',
                seoUrl: 'snehurka-bila-kralice',
                isActive: true,
                createdBy: 4
            },
            {
                name: 'Pepíček',
                speciesId: 4,
                ownerId: 5,
                birthDate: new Date('2022-06-10'),
                gender: 'samec',
                description: 'Veselá andulka s krásným modrým zbarvením. Velmi mluvný a společenský. Umí říct několik slov a napodobuje různé zvuky.',
                seoUrl: 'pepicek-andulka-modra',
                isActive: true,
                createdBy: 5
            },
            {
                name: 'Ořešek',
                speciesId: 5,
                ownerId: 2,
                birthDate: new Date('2022-03-25'),
                gender: 'samec',
                description: 'Roztomilé morče s hnědým kožíškem připomínajícím ořech. Velmi aktivní a zvídavé. Miluje čerstvou zeleninu a vydává roztomilé zvuky.',
                seoUrl: 'oresek-morce-hnede',
                isActive: true,
                createdBy: 2
            },
            {
                name: 'Zlatíčko',
                speciesId: 6,
                ownerId: 3,
                birthDate: new Date('2023-02-14'),
                gender: 'samice',
                description: 'Malý zlatý křeček s velkými tmavými očky. Velmi aktivní, hlavně v noci. Miluje běhání v kolečku a sbírání potravy do lícních váčků.',
                seoUrl: 'zlaticko-krecek-zlaty',
                isActive: true,
                createdBy: 3
            },
            {
                name: 'Duhový',
                speciesId: 7,
                ownerId: 4,
                birthDate: new Date('2023-05-01'),
                gender: 'samec',
                description: 'Krásná gupka s duhově přelivajícími se ploutkami. Velmi klidná a elegantní rybka. Skvělá do společenského akvária.',
                seoUrl: 'duhovy-gupka-samec',
                isActive: true,
                createdBy: 4
            },
            {
                name: 'Pomalka',
                speciesId: 8,
                ownerId: 5,
                birthDate: new Date('2018-08-30'),
                gender: 'samice',
                description: 'Majestátní vodní želva s krásnými červenými skvrnami za očima. Velmi klidná a moudrá. Miluje slunění na kameni a plavání.',
                seoUrl: 'pomalka-zelva-vodní',
                isActive: true,
                createdBy: 5
            }
        ]);
        console.log(`✅ Vytvořeno ${animals.length} zvířat`);
        console.log('📝 Vytvářím vlastnosti zvířat...');
        const animalProperties = [];
        animalProperties.push({ animalId: 1, propertyName: 'Plemeno', propertyValue: 'Německý ovčák' }, { animalId: 1, propertyName: 'Výška', propertyValue: '65' }, { animalId: 1, propertyName: 'Váha', propertyValue: '35' }, { animalId: 1, propertyName: 'Barva srsti', propertyValue: 'černohnědá' }, { animalId: 1, propertyName: 'Očkování', propertyValue: 'true' }, { animalId: 1, propertyName: 'Čip', propertyValue: '900032002345678' });
        animalProperties.push({ animalId: 2, propertyName: 'Plemeno', propertyValue: 'Zlatý retrívr' }, { animalId: 2, propertyName: 'Výška', propertyValue: '58' }, { animalId: 2, propertyName: 'Váha', propertyValue: '28' }, { animalId: 2, propertyName: 'Barva srsti', propertyValue: 'zlatá' }, { animalId: 2, propertyName: 'Očkování', propertyValue: 'true' }, { animalId: 2, propertyName: 'Čip', propertyValue: '900032002345679' });
        animalProperties.push({ animalId: 3, propertyName: 'Plemeno', propertyValue: 'Rottweiler' }, { animalId: 3, propertyName: 'Výška', propertyValue: '68' }, { animalId: 3, propertyName: 'Váha', propertyValue: '42' }, { animalId: 3, propertyName: 'Barva srsti', propertyValue: 'černohnědá' }, { animalId: 3, propertyName: 'Očkování', propertyValue: 'true' }, { animalId: 3, propertyName: 'Čip', propertyValue: '900032002345680' });
        animalProperties.push({ animalId: 4, propertyName: 'Plemeno', propertyValue: 'Perská kočka' }, { animalId: 4, propertyName: 'Váha', propertyValue: '4.2' }, { animalId: 4, propertyName: 'Barva srsti', propertyValue: 'stříbrná' }, { animalId: 4, propertyName: 'Délka srsti', propertyValue: 'dlouhá' }, { animalId: 4, propertyName: 'Očkování', propertyValue: 'true' }, { animalId: 4, propertyName: 'Kastrace/sterilizace', propertyValue: 'true' });
        animalProperties.push({ animalId: 5, propertyName: 'Plemeno', propertyValue: 'Mainský mýval' }, { animalId: 5, propertyName: 'Váha', propertyValue: '7.8' }, { animalId: 5, propertyName: 'Barva srsti', propertyValue: 'stříbrně pruhovaná' }, { animalId: 5, propertyName: 'Délka srsti', propertyValue: 'střední' }, { animalId: 5, propertyName: 'Očkování', propertyValue: 'true' }, { animalId: 5, propertyName: 'Kastrace/sterilizace', propertyValue: 'false' });
        animalProperties.push({ animalId: 6, propertyName: 'Plemeno', propertyValue: 'Německý lop' }, { animalId: 6, propertyName: 'Váha', propertyValue: '2.8' }, { animalId: 6, propertyName: 'Barva srsti', propertyValue: 'černobílá' }, { animalId: 6, propertyName: 'Typ uší', propertyValue: 'lop' });
        animalProperties.push({ animalId: 7, propertyName: 'Plemeno', propertyValue: 'Novozélandský bílý' }, { animalId: 7, propertyName: 'Váha', propertyValue: '3.2' }, { animalId: 7, propertyName: 'Barva srsti', propertyValue: 'bílá' }, { animalId: 7, propertyName: 'Typ uší', propertyValue: 'vzpřímené' });
        animalProperties.push({ animalId: 8, propertyName: 'Barevná mutace', propertyValue: 'modrá' }, { animalId: 8, propertyName: 'Umí mluvit', propertyValue: 'true' }, { animalId: 8, propertyName: 'Kroužek', propertyValue: 'CZ-2022-456789' });
        animalProperties.push({ animalId: 9, propertyName: 'Plemeno', propertyValue: 'Americké morče' }, { animalId: 9, propertyName: 'Váha', propertyValue: '850' }, { animalId: 9, propertyName: 'Barva srsti', propertyValue: 'hnědá s bílými skvrnami' });
        animalProperties.push({ animalId: 10, propertyName: 'Váha', propertyValue: '120' }, { animalId: 10, propertyName: 'Barva', propertyValue: 'zlatá' });
        animalProperties.push({ animalId: 11, propertyName: 'Velikost akvária', propertyValue: '60' }, { animalId: 11, propertyName: 'Teplota vody', propertyValue: '24' }, { animalId: 11, propertyName: 'pH vody', propertyValue: '7.2' });
        animalProperties.push({ animalId: 12, propertyName: 'Velikost krunýře', propertyValue: '18' }, { animalId: 12, propertyName: 'Váha', propertyValue: '1.2' }, { animalId: 12, propertyName: 'Typ prostředí', propertyValue: 'vodní' });
        await AnimalProperty_1.default.bulkCreate(animalProperties);
        console.log(`✅ Vytvořeno ${animalProperties.length} vlastností zvířat`);
        console.log('📷 Vytvářím ukázkové obrázky...');
        const imageUrls = [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1553736277-055142d018f0?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=500&h=400&fit=crop',
            'https://images.unsplash.com/photo-1544526226-d4568090ffb8?w=500&h=400&fit=crop'
        ];
        const animalImages = [];
        for (let i = 0; i < animals.length; i++) {
            const animal = animals[i];
            const imageUrl = imageUrls[i % imageUrls.length];
            animalImages.push({
                animalId: animal.id,
                filename: `animal_${animal.id}_primary.jpg`,
                originalName: `${animal.name}_photo.jpg`,
                mimeType: 'image/jpeg',
                size: 150000 + Math.floor(Math.random() * 50000),
                url: imageUrl,
                thumbnailUrl: imageUrl.replace('w=500&h=400', 'w=200&h=150'),
                isPrimary: true,
                uploadedBy: animal.createdBy
            });
            if (i % 3 === 0) {
                animalImages.push({
                    animalId: animal.id,
                    filename: `animal_${animal.id}_secondary.jpg`,
                    originalName: `${animal.name}_photo2.jpg`,
                    mimeType: 'image/jpeg',
                    size: 120000 + Math.floor(Math.random() * 40000),
                    url: imageUrls[(i + 1) % imageUrls.length],
                    thumbnailUrl: imageUrls[(i + 1) % imageUrls.length].replace('w=500&h=400', 'w=200&h=150'),
                    isPrimary: false,
                    uploadedBy: animal.createdBy
                });
            }
        }
        await AnimalImage_1.default.bulkCreate(animalImages);
        console.log(`✅ Vytvořeno ${animalImages.length} obrázků`);
        console.log('\n🎉 Databáze byla úspěšně vyčištěna a naplněna testovacími daty!');
        console.log('\n📊 Přehled vytvořených dat:');
        console.log(`   👥 Uživatelé: ${users.length}`);
        console.log(`   🐕 Druhy zvířat: ${species.length}`);
        console.log(`   � Vlastnosti druhů: ${speciesProperties.length}`);
        console.log(`   �🐾 Zvířata: ${animals.length}`);
        console.log(`   📝 Vlastnosti zvířat: ${animalProperties.length}`);
        console.log(`   📷 Obrázky: ${animalImages.length}`);
        console.log('\n🔑 Testovací přihlašovací údaje:');
        console.log('   📧 Email: admin@petmanagement.cz');
        console.log('   🔒 Heslo: password123');
        console.log('   👤 Role: admin');
        console.log('\n   📧 Email: jana.novakova@email.cz');
        console.log('   🔒 Heslo: password123');
        console.log('   👤 Role: user');
        return {
            users: users.length,
            species: species.length,
            speciesProperties: speciesProperties.length,
            animals: animals.length,
            animalProperties: animalProperties.length,
            images: animalImages.length
        };
    }
    catch (error) {
        console.error('❌ Chyba při naplňování databáze:', error);
        throw error;
    }
}
if (require.main === module) {
    clearAndSeedDatabase()
        .then((result) => {
        console.log('✅ Seed skript dokončen:', result);
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Seed skript selhal:', error);
        process.exit(1);
    });
}
