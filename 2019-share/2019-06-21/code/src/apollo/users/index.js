import path from 'path';
import { ApolloServer, AuthenticationError } from 'apollo-server-koa';
import { importSchema } from 'graphql-import';
import user from '../../controller/user';
export default new ApolloServer({
    typeDefs: importSchema(path.join(__dirname, './type/user.graphql')),
    resolvers: {
        Query: {
            users: user.users,
            getUserById: user.getUserById
        },
        Mutation: {
            add: user.add,
            update: user.update,
            delete: user.delete
        }
    },
});
