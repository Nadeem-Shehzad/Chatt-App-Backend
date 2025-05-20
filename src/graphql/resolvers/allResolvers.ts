import { userResolvers } from "./user";
import { messageResolvers } from "./message";
import { contactResolver } from "./contact";


export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        //...userResolvers.Mutation,
        ...messageResolvers.Mutation,
        ...contactResolver.Mutation
    }
}