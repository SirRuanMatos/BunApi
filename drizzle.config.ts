import type { Config } from "drizzle-kit";

import { env } from "./src/env";

export default {
    out: "./drizzle",
    schema: "./src/db/schema/index.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
} satisfies Config;
