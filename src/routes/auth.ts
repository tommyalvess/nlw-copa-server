import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function authRoutes(fastify:FastifyInstance) {
    
    fastify.get('/me', {
        onRequest:[authenticate]
    }, 
    async (req,rep) => {
        return rep.status(200).send({user: req.user}) 
    })

    fastify.post('/users', async (req,rep) => {
        const createPoolBody = z.object({
            access_token: z.string()
        })

        const {access_token} = createPoolBody.parse(req.body)

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        })

        const useDate = await userResponse.json()

        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url(),
        })

        const userinfo = userInfoSchema.parse(useDate)

        let user = await prisma.user.findUnique({
            where: {
                googleId: userinfo.id
            }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId: userinfo.id,
                    nome: userinfo.name,
                    email: userinfo.email,
                    avatarUrl: userinfo.picture
                }
            })
        }

        //estudar sobre refreshin token 
        const token = fastify.jwt.sign({
            name: user.nome,
            avatarUrl: user.avatarUrl,
        }, {
            sub: user.id,
            expiresIn: '7 days'
        })
        
        return rep.status(200).send("token: " + token) 
    })

}  