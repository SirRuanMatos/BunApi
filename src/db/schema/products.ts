import { pgTable, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { restaurants } from "./restaurants";
import { relations } from "drizzle-orm";
import { orderItems } from ".";

export const products = pgTable("products", {
    id: text("id")
        .$defaultFn(() => createId())
        .primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    priceInCents: integer("price_in_cents").notNull(),
    restaurantId: text("restaurant_id")
        .notNull()
        .references(() => restaurants.id, {
            onDelete: "cascade",
        }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const productsRelations = relations(products, ({ one, many }) => {
    return {
        restaurant: one(restaurants, {
            fields: [products.restaurantId],
            references: [restaurants.id],
            relationName: "product_restaurant",
        }),
        orderItems: many(orderItems),
    };
});
