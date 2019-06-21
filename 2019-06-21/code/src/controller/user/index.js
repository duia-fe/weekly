import { AuthenticationError, ApolloError } from 'apollo-server-koa';
import MD5 from 'blueimp-md5';
import User from '../../model/user';
export default {
    // users: (_, __, { dataSources }) => {
    //     return dataSources.userAPI.findAll();
    // }
    users: (_, __, { token, user }) => {
        // console.log(token);
        // res.status(500);
        return User.findAll({
            attributes: ['id', 'username', 'name'],
            order: [['updatedAt', 'DESC'], ['createdAt', 'DESC']],
            where: { rubbish: '0' }
        });
    },
    getUserById: (_, data, { user }) => {
        return User.findOne({
            attributes: ['id', 'username', 'name'],
            order: [['updatedAt', 'DESC'], ['createdAt', 'DESC']],
            where: { id: data.id }
        });
    },
    add: (_, data, { user }) => {
        const { username, password, name } = data.user;
        return new Promise((resolve, reject) => {
            User.findOne({
                where: { username }
            })
                .then(result => {
                    if (result) {
                        if (result.rubbish === '1') {
                            User.update(
                                {
                                    password: MD5(password),
                                    name,

                                    createdAt: new Date(),
                                    updateAt: null,
                                    rubbish: '0',
                                    operator: user.id
                                },
                                {
                                    where: {
                                        id: result.id
                                    }
                                }
                            )
                                .then(() => resolve(true))
                                .catch(err => {
                                    throw new ApolloError(err, 500);
                                });
                        } else {
                            throw new ApolloError('账号已存在，请重新输入');
                        }
                    } else {
                        User.create({
                            username,
                            password: MD5(password),
                            name,
                            operator: user.id,
                            createdAt: Date.now()
                        })
                            .then(() => resolve(true))
                            .catch(err => {
                                throw new ApolloError(err, 500);
                            });
                    }
                })
                .catch(err => reject(err));
        });
    },
    update: async (_, data, { user }) => {
        const { id, password, name } = data.user;
        return User.update(
            { password: MD5(password), name, operator: user.id, updateAt: new Date() },
            {
                where: {
                    id
                }
            }
        );
    },
    delete: (_, data, { user }) => {
        const { id } = data;
        return User.update(
            {
                rubbish: '1',
                operator: user.id
            },
            {
                where: {
                    id
                }
            }
        );
    }
};
