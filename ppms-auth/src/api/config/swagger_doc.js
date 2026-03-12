import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth Service API",
      version: "1.0.0",
      description: "Auth service for managing users, sessions, and roles "
    },

    servers: [
        {
            url: `http://localhost:${process.env.PORT}/api`,
            description: "Local Development"
        },
        {
            url: `${process.env.AUTH_SERVICE_URL}/api`,
            description: "VPC Internal"
        },
        {
            url: `http://3.231.203.68:8080/api`,
            description: "Public EC2"
        }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "UUID"
        }
      }
    }
  },

  apis: ["./src/api/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;