import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { authLinks, restaurants, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { env } from "../../env";
import { getMessageUrl, mail } from "../../lib/mail";

export const sendAuthLink = new Elysia().post(
    "/authenticate",
    async ({ body, set }) => {
        const { email } = body;

        /* const [userFromEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, email)); */

        const userFromEmail = await db.query.users.findFirst({
            where(fields, { eq }) {
                return eq(fields.email, email);
            },
        });

        if (!userFromEmail) {
            throw new Error("User not found");
        }

        const authLinkCode = createId();

        await db.insert(authLinks).values({
            userId: userFromEmail.id,
            code: authLinkCode,
        });

        const authLink = new URL("/auth-links/authenticate", env.API_BASE_URL);

        authLink.searchParams.set("code", authLinkCode);
        authLink.searchParams.set("redirectUrl", env.AUTH_REDIRECT_URL);

        const info = await mail.sendMail({
            from: {
                name: "Ruan shop",
                address: "hi@ruanshop.com",
            },
            to: email,
            subject: "Authenticate to Ruan Shop",
            text: `Use the following link to authenticate on Ruan Shop:  ${authLink.toString()}`,
        });

        console.log(" info:", getMessageUrl(info));
    },
    {
        body: t.Object({
            email: t.String({ format: "email" }),
        }),
    }
);
