import Koa from 'koa';
import { ApolloServer, gql } from 'apollo-server-koa';

// applo框架
import apollo from '../apollo';

const app = new Koa();
apollo(app);

app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at http://localhost:4000`));
