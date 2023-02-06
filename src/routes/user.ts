import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"

export async function userRoutes(fastify:FastifyInstance) {

    fastify.get('/users/count', async (req,rep) => {

        const count = await prisma.user.count()

        return rep.status(200).send({count}) 
    })
}