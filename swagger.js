import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Restaurant E-commerce API',
    description: 'API Documentation for the Restaurant E-commerce Backend System',
    version: '1.0.0',
  },
  host: 'https://restaurant-api-ruddy.vercel.app/',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Please enter a valid token'
    }
  },
  security: [{ bearerAuth: [] }]
};

const outputFile = './swagger-output.json';
const routes = ['./server.js'];

swaggerAutogen()(outputFile, routes, doc).then(() => {
    console.log("Swagger documentation generated successfully!");
});