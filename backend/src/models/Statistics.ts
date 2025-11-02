import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface StatisticsAttributes {
  id: number;
  date: Date;
  metric: string;
  category: string;
  value: number;
  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StatisticsCreationAttributes extends Optional<StatisticsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Statistics extends Model<StatisticsAttributes, StatisticsCreationAttributes> implements StatisticsAttributes {
  public id!: number;
  public date!: Date;
  public metric!: string;
  public category!: string;
  public value!: number;
  public metadata?: object;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Statistics.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    metric: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'statistics',
    modelName: 'Statistics',
    timestamps: true,
    indexes: [
      {
        fields: ['date'],
      },
      {
        fields: ['metric'],
      },
      {
        fields: ['category'],
      },
      {
        unique: true,
        fields: ['date', 'metric', 'category'],
      },
    ],
  }
);

export { Statistics, StatisticsAttributes, StatisticsCreationAttributes };