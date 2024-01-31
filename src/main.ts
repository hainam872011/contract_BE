import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ValidationError, ValidationPipe, VersioningType } from '@nestjs/common'
import helmet from 'helmet'
import compression from 'compression'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exception.filter'
import { ConfigService } from '@nestjs/config'
import { ValidationException } from './common/exceptions/ValidationException'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.use(helmet())
    app.use(compression())
    const cors = require('cors')
    app.use(cors({ origin: true }))
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                return new ValidationException(
                    validationErrors.map((error) => Object.values(error.constraints).join('')),
                )
            },
        }),
    )
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)))
    app.enableVersioning({
        type: VersioningType.URI,
    })
    const configService = app.get(ConfigService)
    // app.use(function (req, res, next) {
    //     res.header('Access-Control-Allow-Origin', '*')
    //     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    //     next()
    // })
    await app.listen(configService.get('port'))
}

bootstrap()
