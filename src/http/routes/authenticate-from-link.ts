import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import dayjs from "dayjs";
import { authLinks } from "../../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth";

export const authenticateFromLink = new Elysia().use(auth).get(
    "/auth-links/authenticate",
    async ({ query, jwt, cookie: { auth }, redirect, signUser }) => {
        const { code, redirectUrl } = query;

        const authLinkFromCode = await db.query.authLinks.findFirst({
            where(fields, { eq }) {
                return eq(fields.code, code);
            },
        });

        if (!authLinkFromCode) throw new Error("Auth link not found");

        const daysSinceAuthLinkWasCreated = dayjs().diff(
            authLinkFromCode.createdAt,
            "days"
        );

        if (daysSinceAuthLinkWasCreated > 7)
            throw new Error("Auth link expired, please generate a new one");

        const managedRestaurant = await db.query.restaurants.findFirst({
            where(fields, { eq }) {
                return eq(fields.managerId, authLinkFromCode.userId);
            },
        });


        await signUser({
            sub: authLinkFromCode.userId,
            restaurantId: managedRestaurant?.id,
        });

        await db.delete(authLinks).where(eq(authLinks.code, code));

        return redirect(redirectUrl);
    },
    {
        query: t.Object({
            code: t.String(),
            redirectUrl: t.String(),
        }),
    }
);
