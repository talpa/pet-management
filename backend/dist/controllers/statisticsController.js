"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoredStats = exports.saveStatistic = exports.getSystemStats = exports.getLocationStats = exports.getAnimalStats = exports.getPageVisitStats = void 0;
const AuditLog_1 = require("../models/AuditLog");
const Statistics_1 = require("../models/Statistics");
const Animal_1 = __importDefault(require("../models/Animal"));
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const getPageVisitStats = async (req, res) => {
    try {
        const { period = '7d', startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)]
                }
            };
        }
        else {
            const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
            const since = new Date();
            since.setDate(since.getDate() - days);
            dateFilter = {
                createdAt: {
                    [sequelize_1.Op.gte]: since
                }
            };
        }
        const pageStats = await AuditLog_1.AuditLog.findAll({
            where: {
                ...dateFilter,
                method: 'GET',
                statusCode: {
                    [sequelize_1.Op.lt]: 400
                }
            },
            attributes: [
                'resource',
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'visits'],
                [sequelize_1.Sequelize.fn('AVG', sequelize_1.Sequelize.col('responseTime')), 'avgResponseTime']
            ],
            group: ['resource'],
            order: [[sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'DESC']],
            limit: 20
        });
        const dailyStats = await AuditLog_1.AuditLog.findAll({
            where: {
                ...dateFilter,
                method: 'GET'
            },
            attributes: [
                [sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('createdAt')), 'date'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'visits'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.fn('DISTINCT', sequelize_1.Sequelize.col('ipAddress'))), 'uniqueVisitors']
            ],
            group: [sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('createdAt'))],
            order: [[sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('createdAt')), 'ASC']]
        });
        res.json({
            period,
            pageStats,
            dailyStats,
            totalPages: pageStats.length
        });
    }
    catch (error) {
        console.error('Error getting page visit stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPageVisitStats = getPageVisitStats;
const getAnimalStats = async (req, res) => {
    try {
        const speciesStats = await Animal_1.default.findAll({
            attributes: [
                'species',
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            group: ['species'],
            order: [[sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'DESC']]
        });
        const ageStats = await Animal_1.default.findAll({
            attributes: [
                [sequelize_1.Sequelize.literal(`
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 1 THEN 'Do 1 roku'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 3 THEN '1-3 roky'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 7 THEN '4-7 let'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 12 THEN '8-12 let'
            ELSE 'Nad 12 let'
          END
        `), 'ageGroup'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                birthDate: {
                    [sequelize_1.Op.not]: null
                }
            },
            group: [sequelize_1.Sequelize.literal(`
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 1 THEN 'Do 1 roku'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 3 THEN '1-3 roky'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 7 THEN '4-7 let'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) <= 12 THEN '8-12 let'
          ELSE 'Nad 12 let'
        END
      `)],
            order: [[sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'DESC']],
            raw: true
        });
        const nameStats = await Animal_1.default.findAll({
            attributes: [
                'name',
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                name: {
                    [sequelize_1.Op.not]: null,
                    [sequelize_1.Op.ne]: ''
                }
            },
            group: ['name'],
            having: sequelize_1.Sequelize.literal('COUNT(id) > 1'),
            order: [[sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'DESC']],
            limit: 20
        });
        res.json({
            speciesStats,
            ageStats,
            nameStats,
            totalAnimals: await Animal_1.default.count()
        });
    }
    catch (error) {
        console.error('Error getting animal stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAnimalStats = getAnimalStats;
const getLocationStats = async (req, res) => {
    try {
        const addressStats = await User_1.User.findAll({
            attributes: [
                [sequelize_1.Sequelize.fn('SUBSTRING', sequelize_1.Sequelize.col('address'), sequelize_1.Sequelize.literal("FROM '[0-9]{5}\\s+([^,]+)'")), 'city'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                address: {
                    [sequelize_1.Op.not]: null,
                    [sequelize_1.Op.ne]: ''
                }
            },
            group: [sequelize_1.Sequelize.fn('SUBSTRING', sequelize_1.Sequelize.col('address'), sequelize_1.Sequelize.literal("FROM '[0-9]{5}\\s+([^,]+)'"))],
            order: [[sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'DESC']],
            limit: 20,
            raw: true
        });
        const completeAddressCount = await User_1.User.count({
            where: {
                address: {
                    [sequelize_1.Op.not]: null,
                    [sequelize_1.Op.ne]: '',
                    [sequelize_1.Op.like]: '%,%'
                }
            }
        });
        const contactStats = {
            withPhone: await User_1.User.count({
                where: {
                    phone: { [sequelize_1.Op.not]: null, [sequelize_1.Op.ne]: '' }
                }
            }),
            withViber: await User_1.User.count({
                where: {
                    viber: { [sequelize_1.Op.not]: null, [sequelize_1.Op.ne]: '' }
                }
            }),
            withWhatsapp: await User_1.User.count({
                where: {
                    whatsapp: { [sequelize_1.Op.not]: null, [sequelize_1.Op.ne]: '' }
                }
            }),
            withSignal: await User_1.User.count({
                where: {
                    signal: { [sequelize_1.Op.not]: null, [sequelize_1.Op.ne]: '' }
                }
            })
        };
        res.json({
            addressStats,
            completeAddressCount,
            contactStats,
            totalUsers: await User_1.User.count()
        });
    }
    catch (error) {
        console.error('Error getting location stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getLocationStats = getLocationStats;
const getSystemStats = async (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const totalUsers = await User_1.User.count();
        const totalAnimals = await Animal_1.default.count();
        const activeUsers24h = await AuditLog_1.AuditLog.count({
            distinct: true,
            col: 'userId',
            where: {
                createdAt: { [sequelize_1.Op.gte]: last24h },
                userId: { [sequelize_1.Op.not]: null }
            }
        });
        const newUsers7d = await User_1.User.count({
            where: { createdAt: { [sequelize_1.Op.gte]: last7d } }
        });
        const newUsers30d = await User_1.User.count({
            where: { createdAt: { [sequelize_1.Op.gte]: last30d } }
        });
        const visits24h = await AuditLog_1.AuditLog.count({
            where: {
                createdAt: { [sequelize_1.Op.gte]: last24h },
                method: 'GET'
            }
        });
        const visits7d = await AuditLog_1.AuditLog.count({
            where: {
                createdAt: { [sequelize_1.Op.gte]: last7d },
                method: 'GET'
            }
        });
        const topErrors = await AuditLog_1.AuditLog.findAll({
            where: {
                statusCode: { [sequelize_1.Op.gte]: 400 },
                createdAt: { [sequelize_1.Op.gte]: last7d }
            },
            attributes: [
                'statusCode',
                'resource',
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            group: ['statusCode', 'resource'],
            order: [[sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'DESC']],
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
    }
    catch (error) {
        console.error('Error getting system stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSystemStats = getSystemStats;
const saveStatistic = async (req, res) => {
    try {
        const { date, metric, category, value, metadata } = req.body;
        if (!date || !metric || !category || value === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const [statistic, created] = await Statistics_1.Statistics.findOrCreate({
            where: { date, metric, category },
            defaults: { value, metadata }
        });
        if (!created) {
            await statistic.update({ value, metadata });
        }
        res.json({ statistic, created });
    }
    catch (error) {
        console.error('Error saving statistic:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.saveStatistic = saveStatistic;
const getStoredStats = async (req, res) => {
    try {
        const { metric, category, startDate, endDate, limit = 50 } = req.query;
        let whereClause = {};
        if (metric)
            whereClause.metric = metric;
        if (category)
            whereClause.category = category;
        if (startDate && endDate) {
            whereClause.date = {
                [sequelize_1.Op.between]: [startDate, endDate]
            };
        }
        const statistics = await Statistics_1.Statistics.findAll({
            where: whereClause,
            order: [['date', 'DESC']],
            limit: parseInt(limit)
        });
        res.json({ statistics });
    }
    catch (error) {
        console.error('Error getting stored stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getStoredStats = getStoredStats;
