import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app/app.module'
import { randomBytes } from 'crypto'
import { Logger } from '@nestjs/common'
import * as process from 'process'
import * as bodyParser from 'body-parser'

async function bootstrap() {
    const logger = new Logger(bootstrap.name)

    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: '*',
        },

        snapshot: true,
        logger: ['error', 'warn', 'log'],
    })
    app.enableCors()
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
    await app.listen(process.env.PORT)

    if (process.env.SECRET_TOKEN === 'change this') {
        randomBytes(64, (err, buf) => {
            logger.warn(`Update secret key: ${buf.toString('hex')}`)
        })
    }
}
bootstrap()
