import * as cron from 'node-cron';
import { AuditLog } from '../models/AuditLog';
import { Statistics } from '../models/Statistics';
import { User } from '../models/User';
import Animal from '../models/Animal';
import { Op, Sequelize } from 'sequelize';

class ScheduledTasksService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  // Inicializace všech scheduled tasků
  public initializeTasks() {
    console.log('🚀 Initializing scheduled tasks...');

    // Denní cleanup audit logů (každý den ve 2:00)
    this.scheduleTask('daily-audit-cleanup', '0 2 * * *', this.cleanupAuditLogs);

    // Denní agregace statistik (každý den ve 3:00)  
    this.scheduleTask('daily-stats-aggregation', '0 3 * * *', this.aggregateDailyStats);

    // Týdenní sumarizace (každou neděli ve 4:00)
    this.scheduleTask('weekly-stats-summary', '0 4 * * 0', this.aggregateWeeklyStats);

    // Měsíční archivace (první den měsíce ve 5:00)
    this.scheduleTask('monthly-archive', '0 5 1 * *', this.monthlyArchive);

    console.log(`✅ Scheduled ${this.tasks.size} tasks successfully`);
  }

  // Metoda pro plánování úlohy
  private scheduleTask(name: string, cronExpression: string, taskFunction: () => Promise<void>) {
    try {
      const task = cron.schedule(cronExpression, async () => {
        console.log(`🕐 Running scheduled task: ${name}`);
        const startTime = Date.now();
        
        try {
          await taskFunction.call(this);
          const duration = Date.now() - startTime;
          console.log(`✅ Task ${name} completed in ${duration}ms`);
          
          // Zalogujeme úspěšné dokončení
          await this.logTaskExecution(name, 'success', duration);
        } catch (error) {
          console.error(`❌ Task ${name} failed:`, error);
          await this.logTaskExecution(name, 'error', Date.now() - startTime, error);
        }
      }, {
        scheduled: false // Nezačneme hned, ale až ručně
      });

      this.tasks.set(name, task);
      task.start();
      console.log(`📅 Scheduled task "${name}" with cron: ${cronExpression}`);
    } catch (error) {
      console.error(`Failed to schedule task ${name}:`, error);
    }
  }

  // Cleanup starých audit logů (starších než 90 dní)
  private async cleanupAuditLogs(): Promise<void> {
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deletedCount = await AuditLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });

    console.log(`🗑️ Cleaned up ${deletedCount} audit log entries older than ${retentionDays} days`);

    // Uložíme statistiku o čištění
    await Statistics.findOrCreate({
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

  // Agregace denních statistik
  private async aggregateDailyStats(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];

    // Počet nových uživatelů
    const newUsersCount = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(dateString),
          [Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // Počet nových zvířat
    const newAnimalsCount = await Animal.count({
      where: {
        created_at: {
          [Op.gte]: new Date(dateString),
          [Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // Celkový počet návštěv
    const totalVisits = await AuditLog.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(dateString),
          [Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        },
        method: 'GET'
      }
    });

    // Unikátní návštěvníci
    const uniqueVisitors = await AuditLog.count({
      distinct: true,
      col: 'ipAddress',
      where: {
        createdAt: {
          [Op.gte]: new Date(dateString),
          [Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        },
        method: 'GET'
      }
    });

    // Uložíme všechny statistiky
    const stats = [
      { metric: 'new_users', category: 'daily', value: newUsersCount },
      { metric: 'new_animals', category: 'daily', value: newAnimalsCount },
      { metric: 'total_visits', category: 'daily', value: totalVisits },
      { metric: 'unique_visitors', category: 'daily', value: uniqueVisitors }
    ];

    for (const stat of stats) {
      await Statistics.findOrCreate({
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

  // Týdenní sumarizace
  private async aggregateWeeklyStats(): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const dateString = endDate.toISOString().split('T')[0];

    // Sumarizace týdenních dat z denních statistik
    const weeklyStats = await Statistics.findAll({
      attributes: [
        'metric',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'total'],
        [Sequelize.fn('AVG', Sequelize.col('value')), 'average']
      ],
      where: {
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], dateString]
        },
        category: 'daily'
      },
      group: ['metric'],
      raw: true
    });

    // Uložíme týdenní sumarizace
    for (const stat of weeklyStats as any[]) {
      await Statistics.findOrCreate({
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

  // Měsíční archivace
  private async monthlyArchive(): Promise<void> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthString = lastMonth.toISOString().substring(0, 7); // YYYY-MM

    // Počítáme celkové statistiky za měsíc
    const monthlyData = await Statistics.findAll({
      attributes: [
        'metric',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'total'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        date: {
          [Op.like]: `${monthString}%`
        },
        category: ['daily', 'weekly']
      },
      group: ['metric'],
      raw: true
    });

    // Uložíme měsíční archiv
    for (const data of monthlyData as any[]) {
      await Statistics.findOrCreate({
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

  // Logování provedení úloh
  private async logTaskExecution(taskName: string, status: 'success' | 'error', duration: number, error?: any): Promise<void> {
    try {
      await AuditLog.create({
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
    } catch (logError) {
      console.error('Failed to log task execution:', logError);
    }
  }

  // Manuální spuštění úlohy
  public async runTask(taskName: string): Promise<void> {
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

  // Zastavení všech úloh
  public stopAllTasks(): void {
    console.log('🛑 Stopping all scheduled tasks...');
    this.tasks.forEach((task, name) => {
      task.destroy();
      console.log(`Stopped task: ${name}`);
    });
    this.tasks.clear();
  }

  // Získání stavu úloh
  public getTasksStatus(): { name: string; running: boolean; nextRun?: Date }[] {
    const status: { name: string; running: boolean; nextRun?: Date }[] = [];
    
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

export default new ScheduledTasksService();