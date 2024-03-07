import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: [
                { level: 'error', emit: 'stdout' },
                { level: 'query', emit: 'event' },
            ],
            errorFormat: 'pretty',
        })
        this.$on<any>('error', (event: Prisma.QueryEvent) => {
            console.log('Query error: ' + event.query)
            console.log('Duration: ' + event.duration + 'ms')
        })
        // this.$on<any>('query', (e: Prisma.QueryEvent) => {
        //     console.log('Query: ' + e.query)
        //     console.log('Params: ' + e.params)
        //     console.log('Duration: ' + e.duration + 'ms')
        // })
    }

    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close()
        })
    }
}
