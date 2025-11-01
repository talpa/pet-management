"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGroup = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class UserGroup extends sequelize_1.Model {
}
exports.UserGroup = UserGroup;
UserGroup.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique group name',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Group description and purpose',
    },
    color: {
        type: sequelize_1.DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#1976d2',
        comment: 'Hex color code for UI display',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: 'Whether the group is active',
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id',
        },
        comment: 'ID of user who created this group',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'UserGroup',
    tableName: 'user_groups',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['name'],
            name: 'unique_group_name',
        },
    ],
});
//# sourceMappingURL=UserGroup.js.map