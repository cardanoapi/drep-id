import swaggerJsdoc from "swagger-jsdoc";
import * as dotenv from "dotenv";
dotenv.config();

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Drep-ID",
      version: "1.0.0",
      description: "API for DRep registration and metadata retrieval",
    },
    servers: [
      {
        url: `http://localhost:${process.env.SOCKET_PORT || 3000}`,
      },
      {
        url: `https://drep.id/`,
      },
    ],
  },
  apis: [`${__dirname}/server.ts`],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
