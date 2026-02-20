// GraphQL-Server mit Apollo und Express
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const path = require('path');

// Schema laden
const schemaFiles = loadFilesSync(path.join(__dirname, '../pingme-graphql/schema/*.graphql'));
const typeDefs = schemaFiles.join('\n');

// Echte Resolver mit Backend-Logik
const mongoose = require('./db/db-connector');
const User = require('./db/models/users.model');

const resolvers = {
  Query: {
    users: async () => {
      const users = await User.find().select('name tag email createdAt');
      return users.map(user => ({
        id: user._id.toString(),
        username: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }));
    },
    user: async (_, { id }) => {
      const user = await User.findById(id).select('name tag email createdAt');
      if (!user) return null;
      return {
        id: user._id.toString(),
        username: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      };
    },
    // ...weitere Query-Resolver
  },
  Mutation: {
    updateUser: async (_, { id, username, email, password }) => {
      const update = {};
      if (username) update.name = username;
      if (email) update.email = email;
      if (password) update.password = password; // Achtung: Passwort-Hashing fehlt hier noch!
      const user = await User.findByIdAndUpdate(id, update, { new: true });
      if (!user) throw new Error('User not found');
      return {
        id: user._id.toString(),
        username: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      };
    },
    deleteUser: async (_, { id }) => {
      const res = await User.findByIdAndDelete(id);
      return !!res;
    },
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
