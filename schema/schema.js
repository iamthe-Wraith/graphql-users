const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue) {
        return axios.get(`http://localhost:3001/companies/${parentValue.id}/users`)
          .then(res => res.data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue) {
        return axios.get(`http://localhost:3001/companies/${parentValue.companyId}`)
          .then(res => res.data);
      }
    },
  })
});

const query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(_, args) {
        return axios.get(`http://localhost:3001/users/${args.id}`)
          .then(res => res.data);
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(_, args) {
        return axios.get(`http://localhost:3001/companies/${args.id}`)
          .then(res => res.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(_, { name, age }) {
        return axios.post('http://localhost:3001/users', { name, age })
          .then(res => res.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(_, { id }) {
        return axios.delete(`http://localhost:3001/users/${id}`)
          .then(res => res.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(_, { id, name, age, companyId }) {
        const options = {};
        if (name) options.name = name;
        if (age) options.age = age;
        if (companyId) options.companyId = companyId;

        return axios.patch(`http://localhost:3001/users/${id}`, options)
          .then(res => res.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query,
  mutation
})