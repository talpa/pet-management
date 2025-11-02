"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const AuditLog_1 = require("../models/AuditLog");
const Statistics_1 = require("../models/Statistics");
const User_1 = require("../models/User");
const Animal_1 = __importDefault(require("../models/Animal"));
const sequelize_1 = require("sequelize");
class ScheduledTasksService {
    constructor() {
        this.tasks = new Map();
    }
    initializeTasks() {
        console.log('🚀 Initializing scheduled tasks...');
        this.scheduleTask('daily-audit-cleanup', '0 2 * * *', this.cleanupAuditLogs);
        this.scheduleTask('daily-stats-aggregation', '0 3 * * *', this.aggregateDailyStats);
        this.scheduleTask('weekly-stats-summary', '0 4 * * 0', this.aggregateWeeklyStats);
        this.scheduleTask('monthly-archive', '0 5 1 * *', this.monthlyArchive);
        console.log(`✅ Scheduled ${this.tasks.size} tasks successfully`);
    }
    scheduleTask(name, cronExpression, taskFunction) {
        try {
            const task = node_cron_1.default.schedule(cronExpression, async () => {
                console.log(`🕐 Running scheduled task: ${name}`);
                const startTime = Date.now();
                try {
                    await taskFunction.call(this);
                    const duration = Date.now() - startTime;
                    console.log(`✅ Task ${name} completed in ${duration}ms`);
                    await this.logTaskExecution(name, 'success', duration);
                }
                catch (error) {
                    console.error(`❌ Task ${name} failed:`, error);
                    await this.logTaskExecution(name, 'error', Date.now() - startTime, error);
                }
            }, {
                scheduled: false
            });
            this.tasks.set(name, task);
            task.start();
            console.log(`📅 Scheduled task "${name}" with cron: ${cronExpression}`);
        }
        catch (error) {
            console.error(`Failed to schedule task ${name}:`, error);
        }
    }
    async cleanupAuditLogs() {
        const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const deletedCount = await AuditLog_1.AuditLog.destroy({
            where: {
                createdAt: {
                    [sequelize_1.Op.lt]: cutoffDate
                }
            }
        });
        console.log(`🗑️ Cleaned up ${deletedCount} audit log entries older than ${retentionDays} days`);
        await Statistics_1.Statistics.findOrCreate({
            where: {
                date: new Date().toISOString().split('T')[0],
                metric: 'audit_cleanup',
                category: 'maintenance'
            },
            defaults: {
                date: new Date().toISOString().split('T')[0],
                metric: 'audit_cleanup',
                category: 'maintenance',
                value: deletedCount,
                metadata: { retentionDays, cutoffDate }
            }
        });
    }
    async aggregateDailyStats() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toISOString().split('T')[0];
        const newUsersCount = await User_1.User.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: new Date(dateString),
                    [sequelize_1.Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });
        const newAnimalsCount = await Animal_1.default.count({
            where: {
                created_at: {
                    [sequelize_1.Op.gte]: new Date(dateString),
                    [sequelize_1.Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });
        const totalVisits = await AuditLog_1.AuditLog.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: new Date(dateString),
                    [sequelize_1.Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
                },
                method: 'GET'
            }
        });
        const uniqueVisitors = await AuditLog_1.AuditLog.count({
            distinct: true,
            col: 'ipAddress',
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: new Date(dateString),
                    [sequelize_1.Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
                },
                method: 'GET'
            }
        });
        const stats = [
            { metric: 'new_users', category: 'daily', value: newUsersCount },
            { metric: 'new_animals', category: 'daily', value: newAnimalsCount },
            { metric: 'total_visits', category: 'daily', value: totalVisits },
            { metric: 'unique_visitors', category: 'daily', value: uniqueVisitors }
        ];
        for (const stat of stats) {
            await Statistics_1.Statistics.findOrCreate({
                where: {
                    date: dateString,
                    metric: stat.metric,
                    category: stat.category
                },
                defaults: {
                    date: dateString,
                    metric: stat.metric,
                    category: stat.category,
                    value: stat.value,
                    metadata: { aggregatedAt: new Date() }
                }
            });
        }
        console.log(`📊 Aggregated daily stats for ${dateString}: ${newUsersCount} users, ${newAnimalsCount} animals, ${totalVisits} visits`);
    }
    async aggregateWeeklyStats() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        const dateString = endDate.toISOString().split('T')[0];
        const weeklyStats = await Statistics_1.Statistics.findAll({
            attributes: [
                'metric',
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('value')), 'total'],
                [sequelize_1.Sequelize.fn('AVG', sequelize_1.Sequelize.col('value')), 'average']
            ],
            where: {
                date: {
                    [sequelize_1.Op.between]: [startDate.toISOString().split('T')[0], dateString]
                },
                category: 'daily'
            },
            group: ['metric'],
            raw: true
        });
        for (const stat of weeklyStats) {
            await Statistics_1.Statistics.findOrCreate({
                where: {
                    date: dateString,
                    metric: stat.metric,
                    category: 'weekly'
                },
                defaults: {
                    date: dateString,
                    metric: stat.metric,
                    category: 'weekly',
                    value: stat.total,
                    metadata: {
                        average: stat.average,
                        weekStart: startDate.toISOString().split('T')[0],
                        weekEnd: dateString
                    }
                }
            });
        }
        console.log(`📈 Aggregated weekly stats ending ${dateString}`);
    }
    async monthlyArchive() {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthString = lastMonth.toISOString().substring(0, 7);
        const monthlyData = await Statistics_1.Statistics.findAll({
            attributes: [
                'metric',
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('value')), 'total'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                date: {
                    [sequelize_1.Op.like]: `${monthString}%`
                },
                category: ['daily', 'weekly']
            },
            group: ['metric'],
            raw: true
        });
        for (const data of monthlyData) {
            await Statistics_1.Statistics.findOrCreate({
                where: {
                    date: `${monthString}-01`,
                    metric: data.metric,
                    category: 'monthly'
                },
                defaults: {
                    date: `${monthString}-01`,
                    metric: data.metric,
                    category: 'monthly',
                    value: data.total,
                    metadata: {
                        month: monthString,
                        dataPoints: data.count,
                        archivedAt: new Date()
                    }
                }
            });
        }
        console.log(`🗄️ Archived monthly stats for ${monthString}`);
    }
    async logTaskExecution(taskName, status, duration, error) {
        try {
            await AuditLog_1.AuditLog.create({
                userId: null,
                sessionId: 'scheduled-task',
                action: `TASK_${status.toUpperCase()}`,
                resource: 'scheduled-tasks',
                ipAddress: '127.0.0.1',
                userAgent: 'Node.js Scheduler',
                method: 'TASK',
                url: `/tasks/${taskName}`,
                statusCode: status === 'success' ? 200 : 500,
                responseTime: duration,
                metadata: {
                    taskName,
                    status,
                    error: error ? {
                        message: error.message,
                        stack: error.stack
                    } : null
                }
            });
        }
        catch (logError) {
            console.error('Failed to log task execution:', logError);
        }
    }
    async runTask(taskName) {
        console.log(`🔧 Manually running task: ${taskName}`);
        switch (taskName) {
            case 'audit-cleanup':
                await this.cleanupAuditLogs();
                break;
            case 'daily-stats':
                await this.aggregateDailyStats();
                break;
            case 'weekly-stats':
                await this.aggregateWeeklyStats();
                break;
            case 'monthly-archive':
                await this.monthlyArchive();
                break;
            default:
                throw new Error(`Unknown task: ${taskName}`);
        }
    }
    stopAllTasks() {
        console.log('🛑 Stopping all scheduled tasks...');
        this.tasks.forEach((task, name) => {
            task.destroy();
            console.log(`Stopped task: ${name}`);
        });
        this.tasks.clear();
    }
    getTasksStatus() {
        const status = [];
        this.tasks.forEach((task, name) => {
            status.push({
                name,
                running: task.running || false,
                nextRun: task.nextDates() ? task.nextDates()[0] : undefined
            });
        });
        return status;
    }
}
exports.default = new ScheduledTasksService();
