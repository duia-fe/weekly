import users from './users';

export default app => {
    users.applyMiddleware({ app, path: '/users' });
};
