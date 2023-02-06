import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function poolRoutes(fastify:FastifyInstance) {
    
    fastify.get('/pools/count', async (req,rep) => {

        const count = await prisma.pool.count()

        return rep.status(200).send({count}) 
    })

    fastify.post('/pools', async (req,rep) => {

        //criando validacao para a rota. evitar erros.
        const createPoolBody = z.object({
            titulo: z.string(),
        })

        const { titulo } = createPoolBody.parse(req.body)

        const generete = new ShortUniqueId({ length: 6 })
        const code = String(generete()).toUpperCase()

        try {
            await req.jwtVerify()

            await prisma.pool.create({
                data: {
                    titulo: titulo,
                    code,
                    ownerId: req.user.sub,

                    participants: {
                        create: {
                            userId: req.user.sub,
                        }
                    }
                }
            })

        } catch {
            await prisma.pool.create({
                data: {
                    titulo: titulo,
                    code,
                }
            })
        }

        return rep.status(201).send({code})
    })

    // essa rota so é usado se user esrtiver autenticado. 
    fastify.post('/pools/join', 
    {
        onRequest: [authenticate]
    }, async (req, rep) => {
        const joinPoolBody = z.object({
            code: z.string()
        })

        const { code } = joinPoolBody.parse(req.body)

        try {
            
            //validando se esse pool ja existe
            const pool = await prisma.pool.findUnique({
                where: {
                    code,
                },
                include: {
                    participants: {
                        where: {
                            userId: req.user.sub
                        }
                    }
                }
            })

            if (!pool) {
                return rep.status(400).send({
                    message: 'Pools not found!'
                })
            } 

            //validar se o user ja nao ta no bolao. 
            if (pool.participants.length > 0) {
                return rep.status(400).send({
                    message: 'You already joined this polls'
                })
            }

            //validando se o tem ownerId
            if (!pool.ownerId) {
                await prisma.pool.update({
                    where: {
                        id: pool.id
                    },
                    data: {
                        ownerId: req.user.sub
                    }
                })
            }

            await prisma.participant.create({
                data: {
                    poolId: pool.id,
                    userId: req.user.sub
                }
            })

            return rep.status(201).send()

        } catch (error) {
            console.log(error);
            return rep.status(400).send(error)
        }
    })

    fastify.get('/pools', {
        onRequest: [authenticate]
    },async (req,rep) => {
        const pools = await prisma.pool.findMany({
            where: {
                participants: {
                    //some - seria inclui pelo menos um tem u id do user logado 
                    some: {
                        userId: req.user.sub
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        participants: true
                    }
                },
                participants: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        })

        return rep.status(200).send(pools) 
    })

    fastify.get('/pools/:id', {
        onRequest: [authenticate]
    }, async (req,rep) => {

        const getPoolsParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolsParams.parse(req.params)

        const pool = await prisma.pool.findUnique({
            where: {
               id,
            },
            include: {
                _count: {
                    select: {
                        participants: true
                    }
                },
                participants: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        })

        return rep.status(200).send(pool) 

    })
}