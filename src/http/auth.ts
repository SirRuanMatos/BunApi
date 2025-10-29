import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import type { Static } from "elysia";
import { env } from "../env";

const jwtPayload = t.Object({
    sub: t.String(),
    restaurantId: t.Optional(t.String()),
});

export const auth = new Elysia()
    .use(
        jwt({
            secret: env.JWT_SECRET_KEY,
            schema: jwtPayload,
        })
    )
    .derive({ as: "scoped" }, ({ jwt, cookie: { auth }, cookie }) => {
        return {
            signUser: async (payload: Static<typeof jwtPayload>) => {
                const token = await jwt.sign(payload);
                
                auth.value = token;
                auth.httpOnly = true;
                auth.maxAge = 60 * 60 * 24 * 7; // 7 days
                auth.path = "/";
            },

            signOut: async () => {
                auth.remove();
            },
            getCurrentUser: async () => {
                const authCookie = cookie.auth;
                
                const payload = await jwt.verify(authCookie?.value);

                if (!payload) {
                    throw new Error('Unauthorized')
                }

                return {
                    userId: payload.sub,
                    restaurantId: payload.restaurantId,
                }
            },
        };
    });
