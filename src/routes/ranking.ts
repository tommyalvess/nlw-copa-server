import { FastifyInstance } from "fastify";
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function PoolRanking(fastify:FastifyInstance) {
    fastify.get('/pools/:poolId/ranking', {
        onRequest: [authenticate]
    }, async (req,rep) => {
        const getPoolsRankingParams = z.object({
            poolId: z.string(),
        })

        const { poolId } = getPoolsRankingParams.parse(req.params)

        const poolRanking = await prisma.ranking.findMany({
            orderBy: {
                points: 'desc',
            },
            include:{
                participant: {
                    include: {
                        user: {
                            select: {
                                avatarUrl: true,
                                nome: true,
                            }
                        }
                    }
                }
            },
            where: {
                participant: {
                    poolId: poolId,
                },
           }
        })

        return rep.status(200).send(poolRanking) 

    })
}