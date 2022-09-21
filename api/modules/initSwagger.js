require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.3',
        info: {
            title: 'Aroma UGE API',
            description: 'Documentation de l\'API Aroma UGE',
            version: '1.0.0',
            contact: {
                name: 'Support Aroma UGE',
                email: process.env.MAIL_SUPPORT
            },
            servers: [process.env.URL_API]
        },
        components: {
            securitySchemes: {
                accessToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                refreshToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
    },
    apis: [
        'index.js',
        "./routes/*.js"
    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;