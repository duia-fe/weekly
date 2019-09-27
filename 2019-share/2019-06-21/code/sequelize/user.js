const Sequelize = require('sequelize');

const mysql = new Sequelize('DuiaFE', 'admin', '123456', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    // logging: false,
    timezone: '+08:00'
});

const User = mysql.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '账号'
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '密码'
    },
    name: {
        type: Sequelize.STRING,
        comment: '姓名'
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    operator: {
        type: Sequelize.INTEGER
    },
    rubbish: {
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue: '0',
        comment: '0未删除，1删除'
    }
});
User.sync();
module.exports = User;
