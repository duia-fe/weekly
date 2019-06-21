import Sequelize from 'sequelize';
import mysql from '../mysql';

const User = mysql.define(
    'users',
    {
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
    },
    {
        hooks: {
            afterBulkCreate: async (_, options) => {
                const { operator, username } = options.attributes;
                let user = await User.findOne({
                    where: {
                        id: operator
                    }
                });
            },
            afterBulkUpdate: async options => {
                const { operator } = options.attributes;
                const { id } = options.where;
                let operateUser = await User.findOne({
                    where: {
                        id: operator
                    }
                });
                let user = await User.findOne({
                    where: {
                        id
                    }
                });
            }
        }
    }
);
User.sync();
export default User;
