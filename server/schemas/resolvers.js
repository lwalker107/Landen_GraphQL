const User  = require('../models/User');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {

    me: async (parent, args, context) => {
        if (context.user) {
            const userData = await User.findOne({_id: context.user._id}).select(
                "-__v, -password"
            );
            return userData;
        }
        
        throw new AuthenticationError("You need to be logged in");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      console.log(username, email, password);
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError("Incorrect user credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError("Incorrect password credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
        {
          $addToSet: { savedBooks: bookData },
        },
        {
          new: true,
          runValidators: true,
        }
        );

        return updatedUser
      }
        throw new AuthenticationError("Need to be logged in to save books");
    },

    removeBook: async (parent, { bookId}, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
            {_id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId }}},
            { new: true }
        );

        return updatedUser;
      }
        throw new AuthenticationError("Need to be logged in to delete book");
    },
  },
};

module.exports = resolvers;
