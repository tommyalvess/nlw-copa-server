import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"
import { z } from "zod"

export async function guessRoutes(fastify:FastifyInstance) {
    fastify.get('/guesses/count', async (req,rep) => {

        const count = await prisma.guess.count()

        return rep.status(200).send({count}) 
    })

    fastify.post('/pools/:poolId/games/:gameId/guesses', {
        onRequest: [authenticate]
    }, async (req,rep) => {
        const createGuessParams = z.object({
            poolId: z.string(),
            gameId: z.string()
        })

        const createGuessBody = z.object({
            fristTeamPoints: z.number(),
            secondTeamPoints: z.number(),
        })

        const {gameId,poolId} = createGuessParams.parse(req.params)
        const {fristTeamPoints,secondTeamPoints} = createGuessBody.parse(req.body)

        const participant = await prisma.participant.findUnique({
            where: {
                userId_poolId: {
                    poolId,
                    userId: req.user.sub,
                }
            }
        })

        if(!participant){
            return rep.status(400).send({
                message: "You`re not allowed to create a guess inside this polls"
            }) 
        }

        const guess = await prisma.guess.findUnique({
            where: {
                participantId_gameId: {
                    participantId: participant.id,
                    gameId
                }
            }
        })

        if (guess) {
            return rep.status(400).send({
                message: "You already sent a guess in this game in this polls"
            })  
        }

        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            }
        })

        if (!game) {
            return rep.status(400).send({
                message: "Game not found"
            }) 
        }

        if (game.date < new Date()) {
            return rep.status(400).send({
                message: "You can't send polls after the game date"
            }) 
        }

        await prisma.guess.create({
            data: {
                gameId,
                participantId: participant.id,
                fristTeamPoints,
                secondTeamPoints
            }
        })

        return rep.status(201).send()
    })
}