"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("./config/passport"));
const database_1 = require("./config/database");
require("./models/animalAssociations");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const permissions_1 = __importDefault(require("./routes/permissions"));
const userGroupRoutes_1 = __importDefault(require("./routes/userGroupRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const animals_1 = __importDefault(require("./routes/animals"));
const animalSpecies_1 = __importDefault(require("./routes/animalSpecies"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3300',
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/health', healthRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/permissions', permissions_1.default);
app.use('/api/user-groups', userGroupRoutes_1.default);
app.use('/api/animals', animals_1.default);
app.use('/api/animal', animalSpecies_1.default);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
const startServer = async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('Database connection established successfully.');
        await database_1.sequelize.sync({ force: false });
        console.log('Database synchronized successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map