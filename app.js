const express = require('express')
const { graphqlHTTP } = require('express-graphql')
console.log(graphqlHTTP)
const { 
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLNonNull,
} = require('graphql');
const Mongoose= require('mongoose');

const app = express();

Mongoose.connect('mongodb://localhost/graphql-demo', { useNewUrlParser: true, useUnifiedTopology: true })

const PersonModel = Mongoose.model('person', {
    lastname: String,
    firstname: String
})

const PersonType = new GraphQLObjectType({
    name: 'person',
    fields: {
        id: { type: GraphQLID },
        lastname: { type: GraphQLString },
        firstname: { type: GraphQLString },
    }
})

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'query',
        fields: {
            people: { 
                type: GraphQLList(PersonType),
                resolve: (root, args, context, info) => {
                    return PersonModel.find().exec();
                }
            },
            person: { 
                type: PersonType,
                args: {
                    id: { type: GraphQLNonNull(GraphQLID) }
                },
                resolve: (root, args, context, info) => {
                    return PersonModel.findById(args.id).exec();
                }
            },
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
            person: {
                type: PersonType,
                args: {
                    firstname: { type: GraphQLNonNull(GraphQLString) },
                    lastname: { type: GraphQLNonNull(GraphQLString) }
                },
                resolve: (root, args, context, info) => {
                    const person = new PersonModel(args)
                    return person.save();
                }
            }
        }
    })
})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}))

app.listen(4000, () => {
    console.log('Listening at :4000');
})
