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
const Group = require('./db/models/groups.model');
const Contact = require('./db/models/contacts.model');
const Conversation = require('./db/models/conversations.model');
const Block = require('./db/models/blocks.model');
const Test = require('./db/models/test.model');

const resolvers = {
  Query: {
        blocksByUser: async (_, { userId }) => {
          const blocks = await Block.find({ userId });
          return blocks.map(block => ({
            id: block._id.toString(),
            blockerId: block.userId.toString(),
            blockedId: block.blockedUserId.toString(),
            createdAt: block.createdAt.toISOString()
          }));
        },
        block: async (_, { id }) => {
          const block = await Block.findById(id);
          if (!block) return null;
          return {
            id: block._id.toString(),
            blockerId: block.userId.toString(),
            blockedId: block.blockedUserId.toString(),
            createdAt: block.createdAt.toISOString()
          };
        },
        testMessage: () => ({
          message: "Test API working!",
          timestamp: new Date().toISOString(),
          status: "success"
        }),
    users: async () => {
      const users = await User.find().select('name tag email createdAt');
      return users.map(user => ({
        id: user._id.toString(),
        username: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }));
    },
    contactsByUser: async (_, { userId }) => {
      const contacts = await Contact.find({ createdBy: userId });
      return contacts.map(contact => ({
        id: contact._id.toString(),
        userId: contact.createdBy.toString(),
        contactId: contact.contactUserId.toString(),
        createdAt: contact.createdAt.toISOString()
      }));
    },
    conversationsByUser: async (_, { userId }) => {
      const conversations = await Conversation.find({ participantIds: userId });
      return conversations.map(conv => ({
        id: conv._id.toString(),
        participants: conv.participantIds.map(id => id.toString()),
        createdAt: conv.createdAt.toISOString()
      }));
    },
    conversation: async (_, { id }) => {
      const conv = await Conversation.findById(id);
      if (!conv) return null;
      return {
        id: conv._id.toString(),
        participants: conv.participantIds.map(id => id.toString()),
        createdAt: conv.createdAt.toISOString()
      };
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
    groupsByUser: async (_, { userId }) => {
      const groups = await Group.find({ memberIds: userId });
      return groups.map(group => ({
        id: group._id.toString(),
        name: group.name,
        members: group.memberIds.map(id => id.toString()),
        createdAt: group.createdAt.toISOString()
      }));
    },
    group: async (_, { id }) => {
      const group = await Group.findById(id);
      if (!group) return null;
      return {
        id: group._id.toString(),
        name: group.name,
        members: group.memberIds.map(id => id.toString()),
        createdAt: group.createdAt.toISOString()
      };
    },
  },
  Mutation: {
        blockUser: async (_, { blockerId, blockedId }) => {
          const block = await Block.findOneAndUpdate(
            { userId: blockerId, blockedUserId: blockedId },
            { userId: blockerId, blockedUserId: blockedId },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          return {
            id: block._id.toString(),
            blockerId: block.userId.toString(),
            blockedId: block.blockedUserId.toString(),
            createdAt: block.createdAt.toISOString()
          };
        },
        unblockUser: async (_, { id }) => {
          const res = await Block.findByIdAndDelete(id);
          return !!res;
        },
        createTest: async (_, { name, age, message }) => {
          const test = new Test({ name, age, message });
          await test.save();
          return {
            id: test._id.toString(),
            name: test.name,
            age: test.age,
            message: test.message
          };
        },
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
    addContact: async (_, { userId, contactId }) => {
      const contact = new Contact({
        createdBy: userId,
        contactUserId: contactId,
        username: '', // Optional: aus User holen
        contactName: '', // Optional: aus User holen
        email: '' // Optional: aus User holen
      });
      const savedContact = await contact.save();
      return {
        id: savedContact._id.toString(),
        userId: savedContact.createdBy.toString(),
        contactId: savedContact.contactUserId.toString(),
        createdAt: savedContact.createdAt.toISOString()
      };
    },
    removeContact: async (_, { id }) => {
      const res = await Contact.findByIdAndDelete(id);
      return !!res;
    },
    createConversation: async (_, { participants }) => {
      const conv = new Conversation({
        participantIds: participants
      });
      await conv.save();
      return {
        id: conv._id.toString(),
        participants: conv.participantIds.map(id => id.toString()),
        createdAt: conv.createdAt.toISOString()
      };
    },
    deleteConversation: async (_, { id }) => {
      const res = await Conversation.findByIdAndDelete(id);
      return !!res;
    },
    deleteUser: async (_, { id }) => {
      const res = await User.findByIdAndDelete(id);
      return !!res;
    },
    createGroup: async (_, { name, members }) => {
      const group = new Group({
        name,
        adminIds: members.length > 0 ? [members[0]] : [],
        memberIds: members
      });
      await group.save();
      return {
        id: group._id.toString(),
        name: group.name,
        members: group.memberIds.map(id => id.toString()),
        createdAt: group.createdAt.toISOString()
      };
    },
    addGroupMember: async (_, { groupId, memberId }) => {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { memberIds: memberId } },
        { new: true }
      );
      if (!group) throw new Error('Group not found');
      return {
        id: group._id.toString(),
        name: group.name,
        members: group.memberIds.map(id => id.toString()),
        createdAt: group.createdAt.toISOString()
      };
    },
    removeGroupMember: async (_, { groupId, memberId }) => {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $pull: { memberIds: memberId } },
        { new: true }
      );
      if (!group) throw new Error('Group not found');
      return {
        id: group._id.toString(),
        name: group.name,
        members: group.memberIds.map(id => id.toString()),
        createdAt: group.createdAt.toISOString()
      };
    },
    deleteGroup: async (_, { id }) => {
      const res = await Group.findByIdAndDelete(id);
      return !!res;
    },
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
