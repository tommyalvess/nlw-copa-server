import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            nome: "Tom Alves",
            email: "tommy@hotmail.com",
            avatarUrl: "https://github.com/tommyalvess.png",
        }
    })

    const pool = await prisma.pool.create({
        data: {
            titulo: "Exemple Pool",
            code: "BOL203",
            ownerId: user.id,

            participants: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2023-01-02T14:00:00.201Z',
            firstTeamCountryCode: "DE",
            secondteamCountryCode: "BR"
        }
    })

    await prisma.game.create({
        data: {
            date: '2023-01-07T14:00:00.201Z',
            firstTeamCountryCode: "AR",
            secondteamCountryCode: "BR",

            quesses: {
                create: {
                    fristTeamPoints: 2,
                    secondTeamPoints: 1,

                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id
                            }
                        }
                    }
                }
            }
        }
    })

}

main()