// Import the framework and instantiate it
import envConfig, { API_URL } from '@/config'
import { errorHandlerPlugin } from '@/plugins/errorHandler.plugins'
import validatorCompilerPlugin from '@/plugins/validatorCompiler.plugins'
import accountRoutes from '@/routes/account.route'
import authRoutes from '@/routes/auth.route'
import fastifyAuth from '@fastify/auth'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import fastifySocketIO from 'fastify-socket.io'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import path from 'path'
import { createFolder } from '@/utils/helpers'
import mediaRoutes from '@/routes/media.route'
import staticRoutes from '@/routes/static.route'
import dishRoutes from '@/routes/dish.route'
import testRoutes from '@/routes/test.route'
import { initOwnerAccount } from '@/controllers/account.controller'
import tablesRoutes from '@/routes/table.route'
import guestRoutes from '@/routes/guest.route'
import orderRoutes from '@/routes/order.route'
import { socketPlugin } from '@/plugins/socket.plugins'
import indicatorRoutes from '@/routes/indicator.route'
import autoRemoveRefreshTokenJob from '@/jobs/autoRemoveRefreshToken.job'
import http from 'http'

// Tạo HTTP server với giới hạn header size lớn hơn (32KB thay vì 8KB mặc định)
const server = http.createServer({
  maxHeaderSize: 32 * 1024 // 32KB
})

const fastify = Fastify({
  logger: false,
  serverFactory: (handler) => {
    server.on('request', handler)
    return server
  },
  // Tăng giới hạn kích thước request body và headers để tránh lỗi 431
  bodyLimit: 10 * 1024 * 1024, // 10MB
  // Tăng giới hạn header size (mặc định là 16KB)
  maxParamLength: 500 // Tăng độ dài params
})

// Run the server!
const start = async () => {
  try {
    createFolder(path.resolve(envConfig.UPLOAD_FOLDER))
    autoRemoveRefreshTokenJob()
    const whitelist = [
      envConfig.CLIENT_URL,
      'http://160.250.247.146:3000',
      'http://localhost:3000',
      'https://minka.io.vn',
      'https://www.minka.io.vn'
    ]
    fastify.register(cors, {
      origin: whitelist, // Cho phép các domain cụ thể
      credentials: true, // Cho phép trình duyệt gửi cookie đến server
      allowedHeaders: ['Content-Type', 'Authorization'], // Cho phép Authorization header
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })

    fastify.register(fastifyAuth, {
      defaultRelation: 'and'
    })
    fastify.register(fastifyHelmet, {
      crossOriginResourcePolicy: {
        policy: 'cross-origin'
      }
    })
    fastify.register(fastifyCookie)
    fastify.register(validatorCompilerPlugin)
    fastify.register(errorHandlerPlugin)
    fastify.register(fastifySocketIO, {
      cors: {
        origin: whitelist,
        methods: ['GET', 'POST']
      }
    })
    fastify.register(socketPlugin)
    fastify.register(authRoutes, {
      prefix: '/auth'
    })
    fastify.register(accountRoutes, {
      prefix: '/accounts'
    })
    fastify.register(mediaRoutes, {
      prefix: '/media'
    })
    fastify.register(staticRoutes, {
      prefix: '/static'
    })
    fastify.register(dishRoutes, {
      prefix: '/dishes'
    })
    fastify.register(tablesRoutes, {
      prefix: '/tables'
    })
    fastify.register(orderRoutes, {
      prefix: '/orders'
    })
    fastify.register(testRoutes, {
      prefix: '/test'
    })
    fastify.register(guestRoutes, {
      prefix: '/guest'
    })
    fastify.register(indicatorRoutes, {
      prefix: '/indicators'
    })
    await initOwnerAccount()
    await fastify.listen({
      port: envConfig.PORT,
      host: envConfig.DOCKER ? '0.0.0.0' : 'localhost'
    })
    console.log(`Server đang chạy: ${API_URL}`)
  } catch (err) {
    console.log(err)
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
