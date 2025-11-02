import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { Statistics } from '../models/Statistics';
import Animal from '../models/Animal';
import { User } from '../models/User';
import { Op, Sequelize } from 'sequelize';

// Získání přehledu návštěvnosti stránek
export const getPageVisitStats = async (req: Request, res: Response) => {
  try {
    const { period = '7d', startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        }
      };
    } else {
      const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
      const since = new Date();
      since.setDate(since.getDate() - days);
      dateFilter = {
        createdAt: {
          [Op.gte]: since
        }
      };
    }

    // Nejnavštěvovanější stránky
    const pageStats = await AuditLog.findAll({
      where: {
        ...dateFilter,
        method: 'GET',
        statusCode: {
          [Op.lt]: 400
        }
      },
      attributes: [
        'resource',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'visits'],
        [Sequelize.fn('AVG', Sequelize.col('responseTime')), 'avgResponseTime']
      ],
      group: ['resource'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 20
    });

    // Denní návštěvnost
    const dailyStats = await AuditLog.findAll({
      where: {
        ...dateFilter,
        method: 'GET'
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'visits'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('ipAddress'))), 'uniqueVisitors']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      period,
      pageStats,
      dailyStats,
      totalPages: pageStats.length
    });
  } catch (error) {
    console.error('Error getting page visit stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Statistiky zvířat podle druhů
export const getAnimalStats = async (req: Request, res: Response) => {
  try {
    // Statistiky podle druhů
    const speciesStats = await Animal.findAll({
      attributes: [
        'species',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['species'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
    });

    // Statistiky podle věku
    const ageStats = await Animal.findAll({
      attributes: [
        [Sequelize.literal(`
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 1 THEN 'Do 1 roku'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 3 THEN '1-3 roky'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 7 THEN '4-7 let'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 12 THEN '8-12 let'
            ELSE 'Nad 12 let'
          END
        `), 'ageGroup'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        birthDate: {
          [Op.not]: null
        }
      },
      group: [Sequelize.literal(`
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 1 THEN 'Do 1 roku'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 3 THEN '1-3 roky'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 7 THEN '4-7 let'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 12 THEN '8-12 let'
          ELSE 'Nad 12 let'
        END
      `) as any],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Nejpopulárnější jména
    const nameStats = await Animal.findAll({
      attributes: [
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        name: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      },
      group: ['name'],
      having: Sequelize.literal('COUNT(id) > 1'),
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 20
    });

    res.json({
      speciesStats,
      ageStats,
      nameStats,
      totalAnimals: await Animal.count()
    });
  } catch (error) {
    console.error('Error getting animal stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Statistiky lokací majitelů
export const getLocationStats = async (req: Request, res: Response) => {
  try {
    // Statistiky podle adres (extrahuji město z adresy)
    const addressStats = await User.findAll({
      attributes: [
        [Sequelize.fn('SUBSTRING', Sequelize.col('address'), Sequelize.literal("FROM '[0-9]{5}\\s+([^,]+)'")), 'city'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        address: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      },
      group: [Sequelize.fn('SUBSTRING', Sequelize.col('address'), Sequelize.literal("FROM '[0-9]{5}\\s+([^,]+)'")) as any],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 20,
      raw: true
    });

    // Počet uživatelů s vyplněnými adresami
    const completeAddressCount = await User.count({
      where: {
        address: {
          [Op.not]: null,
          [Op.ne]: '',
          [Op.like]: '%,%' // Obsahuje čárku (předpokládáme strukturovanou adresu)
        }
      }
    });

    // Počet uživatelů s kontaktními údaji
    const contactStats = {
      withPhone: await User.count({
        where: {
          phone: { [Op.not]: null, [Op.ne]: '' }
        }
      }),
      withViber: await User.count({
        where: {
          viber: { [Op.not]: null, [Op.ne]: '' }
        }
      }),
      withWhatsapp: await User.count({
        where: {
          whatsapp: { [Op.not]: null, [Op.ne]: '' }
        }
      }),
      withSignal: await User.count({
        where: {
          signal: { [Op.not]: null, [Op.ne]: '' }
        }
      })
    };

    res.json({
      addressStats,
      completeAddressCount,
      contactStats,
      totalUsers: await User.count()
    });
  } catch (error) {
    console.error('Error getting location stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Obecné statistiky systému
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Základní počty
    const totalUsers = await User.count();
    const totalAnimals = await Animal.count();
    const activeUsers24h = await AuditLog.count({
      distinct: true,
      col: 'userId',
      where: {
        createdAt: { [Op.gte]: last24h },
        userId: { [Op.not]: null }
      }
    });

    // Statistiky registrací
    const newUsers7d = await User.count({
      where: { createdAt: { [Op.gte]: last7d } }
    });
    const newUsers30d = await User.count({
      where: { createdAt: { [Op.gte]: last30d } }
    });

    // Statistiky návštěvnosti
    const visits24h = await AuditLog.count({
      where: {
        createdAt: { [Op.gte]: last24h },
        method: 'GET'
      }
    });
    const visits7d = await AuditLog.count({
      where: {
        createdAt: { [Op.gte]: last7d },
        method: 'GET'
      }
    });

    // Top chyby
    const topErrors = await AuditLog.findAll({
      where: {
        statusCode: { [Op.gte]: 400 },
        createdAt: { [Op.gte]: last7d }
      },
      attributes: [
        'statusCode',
        'resource',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['statusCode', 'resource'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      counts: {
        totalUsers,
        totalAnimals,
        activeUsers24h,
        newUsers7d,
        newUsers30d
      },
      visits: {
        visits24h,
        visits7d
      },
      errors: topErrors,
      generatedAt: now
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Uložení nebo aktualizace statistiky
export const saveStatistic = async (req: Request, res: Response) => {
  try {
    const { date, metric, category, value, metadata } = req.body;

    if (!date || !metric || !category || value === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [statistic, created] = await Statistics.findOrCreate({
      where: { date, metric, category },
      defaults: { value, metadata }
    });

    if (!created) {
      await statistic.update({ value, metadata });
    }

    res.json({ statistic, created });
  } catch (error) {
    console.error('Error saving statistic:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Získání uložených statistik
export const getStoredStats = async (req: Request, res: Response) => {
  try {
    const { metric, category, startDate, endDate, limit = 50 } = req.query;

    let whereClause: any = {};

    if (metric) whereClause.metric = metric;
    if (category) whereClause.category = category;
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const statistics = await Statistics.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
      limit: parseInt(limit as string)
    });

    res.json({ statistics });
  } catch (error) {
    console.error('Error getting stored stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};