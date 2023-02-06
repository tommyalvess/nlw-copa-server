import { FastifyInstance } from "fastify"
import { authenticate } from "../plugins/authenticate"
import { z } from "zod"
import { prisma } from "../lib/prisma"

export async function gameRoutes(fastify:FastifyInstance) {

    fastify.get('/pools/:id/games', {
        onRequest: [authenticate]
    }, async (req,rep) => {

        const getPoolsParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolsParams.parse(req.params)

        const games = await prisma.game.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                quesses: {
                    where: {
                        participant: {
                            userId: req.user.sub,
                            poolId: id,
                        }
                    }
                }
            }
        })

        return rep.status(200).send({games: games.map(game => {
            return {
                ...game,
                guess: game.quesses.length > 0 ? game.quesses[0] : null,
                quesses: undefined
            }
        })}) 


    })

}  