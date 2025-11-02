"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scheduledTasksService_1 = __importDefault(require("../services/scheduledTasksService"));
const auth_1 = require("../middleware/auth");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/status', (0, auditMiddleware_1.logAdminAction)('VIEW_TASKS_STATUS', 'scheduled-tasks'), async (req, res) => {
    try {
        const status = scheduledTasksService_1.default.getTasksStatus();
        res.json({
            tasks: status,
            enabled: process.env.ENABLE_SCHEDULED_TASKS !== 'false'
        });
    }
    catch (error) {
        console.error('Error getting tasks status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/run/:taskName', (0, auditMiddleware_1.logAdminAction)('RUN_TASK', 'scheduled-tasks'), async (req, res) => {
    try {
        const { taskName } = req.params;
        const validTasks = ['audit-cleanup', 'daily-stats', 'weekly-stats', 'monthly-archive'];
        if (!validTasks.includes(taskName)) {
            return res.status(400).json({
                message: 'Invalid task name',
                validTasks
            });
        }
        scheduledTasksService_1.default.runTask(taskName)
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
    }
    catch (error) {
        console.error('Error running task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/stop-all', (0, auditMiddleware_1.logAdminAction)('STOP_ALL_TASKS', 'scheduled-tasks'), async (req, res) => {
    try {
        scheduledTasksService_1.default.stopAllTasks();
        res.json({
            message: 'All scheduled tasks stopped successfully',
            stoppedAt: new Date()
        });
    }
    catch (error) {
        console.error('Error stopping tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/restart', (0, auditMiddleware_1.logAdminAction)('RESTART_TASKS', 'scheduled-tasks'), async (req, res) => {
    try {
        scheduledTasksService_1.default.stopAllTasks();
        setTimeout(() => {
            scheduledTasksService_1.default.initializeTasks();
        }, 1000);
        res.json({
            message: 'Scheduled tasks restart initiated',
            restartedAt: new Date()
        });
    }
    catch (error) {
        console.error('Error restarting tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
