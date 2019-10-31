import { GraphQLServer } from "graphql-yoga";
import * as uuid from 'uuid';

const authorData = [{
    name: "Alvaro Rodriguez",
    email: "hola@gmail.com",
    id: "966c1b9a-5a2a-4a22-acf2-1f6de4e83c1d"
}];

const postData = [{
    id: "1",
    title: "Un post",
    body: "Se mogollon de GraphQL",
    author: "966c1b9a-5a2a-4a22-acf2-1f6de4e83c1d",
    date: "12/12/2012",
    comments:[]
}];
const commentsData = [];

const typeDefs = `

    type Author{
        name: String!
        email: String!
        id: ID!
        posts: [Post!]
    }

    type Comment{
        body: String!
        date: String!
        id: ID!
        author: Author!
    }

    type Post{
        id: ID!
        title: String!
        body: String!
        date: Int!
        author: Author!
        comments: [Comment!]
    }


    type Query{
        author(id: ID!): Author
        post(id: ID!): Post!
    }
    
    type Mutation{
        addAuthor(name: String!, email: String!): Author!
        addPost(title: String!, body: String!, author: ID!): Post!
    }

`

const resolvers = {

    Author: {
        posts: (parent, args, ctx, info) => {
            const authorID = parent.id;
            return postData.filter(obj => obj.author === authorID)
        }
    },

    Post: {
        author: (parent, args, ctx, info) => {
            const authorID = parent.author;
            const result = authorData.find(obj => obj.id === authorID);
            return result;
        },

        comments: (parent, args, ctx, info) => {

        }
    },

    Query: {
        author: (parent, args, ctx, info) => {
            const result = authorData.find(obj => obj.id === args.id);
            return result;
        },

        post: (parent, args, ctx, info) => {
            if(!postData.some(obj => obj.id === args.id)){
                throw new Error(`Unknown post with id ${args.id}`)
            }

            const result = postData.find(obj => obj.id === args.id);
            return result;
        },

    },

    Mutation: {
        addAuthor: (parent, args, ctx, info) => {
            const {name, email} = args;
            if(authorData.some(obj => obj.email === email)){
                throw new Error(`User email ${email} already in use`);
            }

            const author = {
                name,
                email,
                id: uuid.v4()
            }

            authorData.push(author);
            return author;
        },

        addPost: (parent, args, ctx, info) => {
            const {title, body, author} = args;
            if(!authorData.some(obj => obj.id === author)) throw new Error(`Author ${author} not found`)
            const date = new Date().getDate();
            const id = uuid.v4();

            const post = {
                title, body, author, date, id
            };

            postData.push(post);
            return post;
        }

    }
}

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server started"));