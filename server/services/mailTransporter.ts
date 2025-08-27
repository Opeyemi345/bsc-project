import transporter from "../config/nodeMailerConfig";

export default async function sendMail(reciever: string, subject: string, html: string, text?: string) {
    transporter.sendMail({
        from: "'noreply' <noreply@oausconnect>",
        to: reciever,
        subject,
        text,
        html
    }).then((res) => {
        console.log(res)
    }).catch((err) => console.error(err));
}