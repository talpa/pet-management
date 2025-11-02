"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAdminAction = exports.logUserAction = exports.auditMiddleware = void 0;
const AuditLog_1 = require("../models/AuditLog");
const uuid_1 = require("uuid");
const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        req.sessionId = (0, uuid_1.v4)();
        req.startTime = Date.now();
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const auditAction = action || `${req.method} ${req.route?.path || req.path}`;
        const auditResource = resource || extractResourceFromPath(req.path);
        const metadata = {
            method: req.method,
            url: req.url,
            path: req.path,
            query: req.query,
            headers: {
                'content-type': req.headers['content-type'],
                'user-agent': userAgent,
                'referer': req.headers['referer'],
            },
        };
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            metadata.body = sanitizeBody(req.body);
        }
        try {
            await AuditLog_1.AuditLog.create({
                userId: req.user?.id || null,
                sessionId: req.sessionId,
                action: auditAction,
                resource: auditResource,
                ipAddress,
                userAgent,
                method: req.method,
                url: req.url,
                statusCode: null,
                responseTime: null,
                metadata,
            });
        }
        catch (error) {
            console.error('Audit logging error:', error);
        }
        const originalSend = res.send;
        res.send = function (body) {
            updateAuditLogResponse(req, res, body);
            return originalSend.call(this, body);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
async function updateAuditLogResponse(req, res, responseBody) {
    if (!req.sessionId)
        return;
    const responseTime = req.startTime ? Date.now() - req.startTime : null;
    try {
        await AuditLog_1.AuditLog.update({
            statusCode: res.statusCode,
            responseTime,
            metadata: {
                ...(await AuditLog_1.AuditLog.findOne({ where: { sessionId: req.sessionId } }))?.metadata,
                response: {
                    statusCode: res.statusCode,
                    size: JSON.stringify(responseBody).length,
                    hasError: res.statusCode >= 400,
                },
            },
        }, {
            where: { sessionId: req.sessionId },
        });
    }
    catch (error) {
        console.error('Audit log update error:', error);
    }
}
function extractResourceFromPath(path) {
    const segments = path.split('/').filter(Boolean);
    if (segments[0] === 'api') {
        return segments[1] || 'unknown';
    }
    return segments[0] || 'unknown';
}
function sanitizeBody(body) {
    if (!body || typeof body !== 'object')
        return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
const logUserAction = (action, resource) => {
    return (0, exports.auditMiddleware)(action, resource);
};
exports.logUserAction = logUserAction;
const logAdminAction = (action, resource) => {
    return (req, res, next) => {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        return (0, exports.auditMiddleware)(`ADMIN_${action}`, resource)(req, res, next);
    };
};
exports.logAdminAction = logAdminAction;
