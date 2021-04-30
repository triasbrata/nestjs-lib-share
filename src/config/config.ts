import { Transport } from '@nestjs/microservices';
import database from './database';
export const FORMAT_DATE = "Y-MM-DD HH:mm:ss";
export const rmqConfig = () => {
  const baseOptions = {
    transport: Transport.RMQ,
    options: {
      urls: process.env['RMQ_URL']
        ? process.env['RMQ_URL']?.split('|')
        : undefined,
      noAck: false,
      prefetchCount: 4,
    },
  };
  const recoveryQueue = 'Qrecovery';
  const scrapiogQueue = process.env['RMQ_QUEUE_NAME'] || 'Qscraping';
  return {
    rmq: {
      scrapper: {
        ...baseOptions,
        options: {
          ...baseOptions.options,
          queue: scrapiogQueue,
          queueOptions: {
            durable: true,
            deadLetterExchange: '',
            // dead letters from our burger-queue should be routed to the recovery-queue
            deadLetterRoutingKey: recoveryQueue,
            // set message time to live to 25m
            messageTtl: 60000 * 60 * 30,
          },
        },
      },
      recovery: {
        ...baseOptions,

        options: {
          ...baseOptions.options,
          queue: recoveryQueue,
          prefetchCount: 100,
        },
      },
    },
    tcp: {
      transport: Transport.TCP,
    },
    marketplace:{

      queue: {
        ...baseOptions,
        options:{
          ...baseOptions.options,
          prefetchCount:1,
          queue: process.env['RMQ_MARKETPLACE_QUEUE_NAME'] || "QMarketplace",
        }
      }
    }
  };
};
export const defaultConfigOptions = {
  isGlobal: true,
  load: [rmqConfig, database],
  envFilePath: ['.env.prod', '.env.dev', '.env'],
};
