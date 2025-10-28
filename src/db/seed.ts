/* eslint-disable drizzle/enforce-delete-with-where */
import { faker } from "@faker-js/faker";

import { users, restaurants } from "./schema";
import { db } from "./connection";
import chalk from "chalk";

/* Reset DB */
await db.delete(users);
await db.delete(restaurants);

console.log(chalk.yellow("✔️ Database reset!"));

/* Create customer */
await db.insert(users).values([
    {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: "customer",
    },
    {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: "customer",
    },
]);

console.log(chalk.yellow("✔️ Created customers!"));

/* Create customer */
const [manager] = await db
    .insert(users)
    .values([
        {
            name: faker.person.fullName(),
            email: "admin@admin.com",
            role: "manager",
        },
    ])
    .returning({ id: users.id });

console.log(chalk.yellow("✔️ Created managers!"));

await db.insert(restaurants).values([
    {
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        managerId: manager?.id,
    },
]);

console.log(chalk.yellow("✔️ Created Restaurant!"));

console.log(chalk.greenBright("Database seeded successfully! 🌲"));
process.exit();
