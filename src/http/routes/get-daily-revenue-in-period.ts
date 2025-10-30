import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { orders } from "../../db/schema";
import { and, eq, gte, sql, sum, lte } from "drizzle-orm";
import dayjs from "dayjs";

export const getDailyRevenuePeriod = new Elysia().use(auth).get(
    "/metrics/daily-revenue-period",
    async ({ getCurrentUser, query, set }) => {
        const { restaurantId } = await getCurrentUser();

        if (!restaurantId) {
            throw new UnauthorizedError();
        }

        const { from, to } = query;

        const startDate = from ? dayjs(from) : dayjs().subtract(7, "days");
        const endDate = to
            ? dayjs(to)
            : from
              ? startDate.add(7, "days")
              : dayjs();

        if (endDate.diff(startDate, "days") > 7) {
            set.status = 400;

            return {
                message:
                    "You cannot return revenue in a larger period than 7 days",
            };
        }

        const revenuePerDay = await db
            .select({
                date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD/MM')`,
                revenue: sum(orders.totalInCents).mapWith(Number),
            })
            .from(orders)
            .where(
                and(
                    eq(orders.restaurantId, restaurantId),
                    gte(
                        orders.createdAt,
                        startDate
                            .startOf("day")
                            .add(startDate.utcOffset(), "minutes")
                            .toDate()
                    ),
                    lte(
                        orders.createdAt,
                        endDate
                            .endOf("day")
                            .add(endDate.utcOffset(), "minutes")
                            .toDate()
                    )
                )
            )
            .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`);

        const orderRevenuePerDay = revenuePerDay.sort((a, b) => {
            const [dayA, monthA] = a.date.split("/").map(Number);
            const [dayB, monthB] = b.date.split("/").map(Number);

            if (monthA === monthB) {
                return dayA - dayB;
            } else {
                const dateA = new Date(2025, monthA - 1);
                const dateB = new Date(2025, monthB - 1);

                return dateA.getTime() - dateB.getTime();
            }
        });

        return orderRevenuePerDay;
    },
    {
        query: t.Object({
            from: t.Optional(t.String()),
            to: t.Optional(t.String()),
        }),
    }
);
