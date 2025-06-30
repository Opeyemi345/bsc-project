import swaggerJSDoc from "swagger-jsdoc"

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Simple social media app API with swagger",
            version: "0.1.0",
            description: "Simple social media api documentation built with express with love.",
            license: {
                name: "ISC",
                // url: 
            },
            contact: {
                name: "Damilola Oguntola",
                url: "https://linkedin.com/in/damilola-abdulmalik",
                email: "damisco005@gmail.com",
            },
        },
        servers: [
            {
                url: "https://localhost:5000"
            }
        ]
    },
    apis: ["../routes/*.js"]
}

const specs = swaggerJSDoc(options)

export { specs };