import winston from 'winston'

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "/var/log/ppms_app/app.log"
    })
  ],
});

export default logger;