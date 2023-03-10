import cors from "@fastify/cors";
import jwt from '@fastify/jwt'

import Fastify from "fastify";
import { poolRoutes } from "./routes/pool"; 
import { userRoutes } from "./routes/user";
import { guessRoutes } from "./routes/guess";
import { gameRoutes } from "./routes/game";
import { authRoutes } from "./routes/auth";
import { PoolRanking } from "./routes/ranking";

async function bootstrap() {

    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors,{
        origin: true
        //origin: 'www.dominio.com.br' em caso de producao
    })

    await fastify.register(jwt, {
        secret: 'nlwcopa'
    })

    await fastify.register(poolRoutes)
    await fastify.register(userRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(authRoutes)
    await fastify.register(PoolRanking)

    await fastify.listen({port: 3333, host: '0.0.0.0'})
}

bootstrap()