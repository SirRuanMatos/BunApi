import nodemailer from "nodemailer";
import type SESTransport from "nodemailer/lib/ses-transport";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const account = await nodemailer.createTestAccount();

export const mail = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    debug: true,
    auth: {
        user: account.user,
        pass: account.pass,
    },
});

export const getMessageUrl = (
    info: SESTransport.SentMessageInfo | SMTPTransport.SentMessageInfo
) => nodemailer.getTestMessageUrl(info);
