import { Sequelize } from 'sequelize';
import config from 'config';
import log from './logger';

const dbConfig = config.get<{
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>("dbConfig");

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
});

async function connect() {
  try {
    // Test the database connection
    await sequelize.authenticate();

    // Synchronize Sequelize models with the database (optional)
    // This will create the tables if they don't exist
    await sequelize.sync();
    log.info('DB connected');

    // To close the connection when needed:
    // await sequelize.close();
    // log.info('DB connection closed');
  } catch (err) {
    log.error('Could not connect to db:', err);
    process.exit(1);
  }
}

export { sequelize, connect };
