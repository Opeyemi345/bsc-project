import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "example.host.com",
    port: 443,
    secure: true,
    auth: {
        user: 'user@example.com',
        password: '@Password123'
    }
})

const transporter2 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: "OAUTH2",
        user: process.env.MAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    }
})

export default transporter;