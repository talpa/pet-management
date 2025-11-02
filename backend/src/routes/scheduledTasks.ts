import express from 'express';
import { Request, Response } from 'express';
import scheduledTasksService from '../services/scheduledTasksService';
import { authenticateToken } from '../middleware/auth';
import { logAdminAction } from '../middleware/auditMiddleware';

const router = express.Router();

// Všechny endpointy vyžadují admin přístup
router.use(authenticateToken);

// Získání stavu všech úloh
router.get('/status', logAdminAction('VIEW_TASKS_STATUS', 'scheduled-tasks'), async (req: Request, res: Response) => {
  try {
    const status = scheduledTasksService.getTasksStatus();
    res.json({
      tasks: status,
      enabled: process.env.ENABLE_SCHEDULED_TASKS !== 'false'
    });
  } catch (error: any) {
    console.error('Error getting tasks status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Manuální spuštění úlohy
router.post('/run/:taskName', logAdminAction('RUN_TASK', 'scheduled-tasks'), async (req: Request, res: Response) => {
  try {
    const { taskName } = req.params;
    const validTasks = ['audit-cleanup', 'daily-stats', 'weekly-stats', 'monthly-archive'];
    
    if (!validTasks.includes(taskName)) {
      return res.status(400).json({ 
        message: 'Invalid task name',
        validTasks 
      });
    }

    // Spustíme úlohu asynchronně
    scheduledTasksService.runTask(taskName)
      .then(() => {
        console.log(`✅ Manual task ${taskName} completed successfully`);
      })
      .catch((error) => {
        console.error(`❌ Manual task ${taskName} failed:`, error);
      });

    res.json({ 
      message: `Task ${taskName} started successfully`,
      taskName,
      startedAt: new Date()
    });
  } catch (error: any) {
    console.error('Error running task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Zastavení všech úloh (pro údržbu)
router.post('/stop-all', logAdminAction('STOP_ALL_TASKS', 'scheduled-tasks'), async (req: Request, res: Response) => {
  try {
    scheduledTasksService.stopAllTasks();
    res.json({ 
      message: 'All scheduled tasks stopped successfully',
      stoppedAt: new Date()
    });
  } catch (error: any) {
    console.error('Error stopping tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Restart všech úloh
router.post('/restart', logAdminAction('RESTART_TASKS', 'scheduled-tasks'), async (req: Request, res: Response) => {
  try {
    scheduledTasksService.stopAllTasks();
    
    // Malá pauza před restartem
    setTimeout(() => {
      scheduledTasksService.initializeTasks();
    }, 1000);

    res.json({ 
      message: 'Scheduled tasks restart initiated',
      restartedAt: new Date()
    });
  } catch (error: any) {
    console.error('Error restarting tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;