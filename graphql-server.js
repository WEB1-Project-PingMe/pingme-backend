// GraphQL-Server mit Apollo und Express
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const path = require('path');

// Schema laden
const schemaFiles = loadFilesSync(path.join(__dirname, '../pingme-graphql/schema/*.graphql'));
const typeDefs = schemaFiles.join('\n');

// Beispiel-Resolver (hier musst du deine Logik einbauen)
const resolvers = {
  Query: {
    users: () => [{ id: '1', username: 'Robin', email: 'robin@example.com', createdAt: '2026-02-20' }],
    user: (_, { id }) => ({ id, username: 'Robin', email: 'robin@example.com', createdAt: '2026-02-20' }),
    // ...weitere Query-Resolver
  },
  Mutation: {
    updateUser: (_, { id, username, email, password }) => ({ id, username, email, createdAt: '2026-02-20' }),
    deleteUser: (_, { id }) => true,
    // ...weitere Mutation-Resolver
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const server = new ApolloServer({ schema });

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  app.listen(4000, () => {
    console.log('GraphQL-Server läuft auf http://localhost:4000/graphql');
  });
}

startServer();
