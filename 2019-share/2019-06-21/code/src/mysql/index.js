import Sequelize from 'sequelize';
import config from '../config/mysql';
export default new Sequelize(config.database, config.user, config.password, {
    dialect: 'mysql',
    host: config.host,
    port: config.port,
    // logging: false,
    timezone: '+08:00'
});
