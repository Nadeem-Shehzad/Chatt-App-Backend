import { userResolvers } from "./user";
import { messageResolvers } from "./message";
import { contactResolver } from "./contact";
import { groupResolver } from "./group";


export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...contactResolver.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        //...userResolvers.Mutation,
        ...messageResolvers.Mutation,
        ...contactResolver.Mutation,
        ...groupResolver.Mutation
    }
}