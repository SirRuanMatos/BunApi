import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { restaurants, users } from "../../db/schema";
import { auth } from "../auth";

export const signOut = new Elysia()
    .use(auth)
    .post("/sign-out", async ({ signOut: internalSignOut }) => {
        internalSignOut();

        return;
    });
