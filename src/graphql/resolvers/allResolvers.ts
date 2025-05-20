import { userResolvers } from "./user";
import { messageResolvers } from "./message";


export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...messageResolvers.Mutation
    }
}