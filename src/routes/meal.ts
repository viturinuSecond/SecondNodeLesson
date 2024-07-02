import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "node:crypto"
import { checkSessionUserId } from "../middlewares/check-session-user-id";
import { knex } from "../database";
import { userGetterBySession } from "../util/user-getter-by-session";

export async function mealRoute(app: FastifyInstance) {

    app.addHook("preHandler", checkSessionUserId)

    app.post("/", async (request, reply) => {
        const mealSchema = z.object({
            name: z.string(),
            description: z.string(),
            time: z.string(),
            onDiet: z.boolean()
        })

        const user = await userGetterBySession(request);

        // if(user.length === 0) reply.status(201).send("User not found") //Não precisa disso, pois já fazemos no preHandler

        const { name, description, time, onDiet } = mealSchema.parse(request.body);
        // const dateHelper = new Date(time);
        await knex.table("meal").insert({
            id: crypto.randomUUID(),
            name,
            description,
            time,
            onDiet,
            user_id: user[0].id
        })

        reply.status(201).send("Refeição criada com sucesso");
    })

    app.put("/:id", async (request, reply) => {
        const paramSchema = z.object({
            id: z.string(),
        })

        const { id } = paramSchema.parse(request.params)

        const mealSchema = z.object({
            name: z.string(),
            description: z.string(),
            time: z.string(),
            onDiet: z.boolean()
        })

        const { name, description, time, onDiet } = mealSchema.parse(request.body);

        const user = await userGetterBySession(request);

        // if(user.length === 0) reply.status(201).send("User not found") //Não precisa disso, pois já fazemos no preHandler
        // const dateHelper = new Date(time);
        await knex("meal").where({
            id, //id do meal, pra alterarmos no database
            user_id: user[0].id //confirmando que é dele (desnecessário dado o fluxo já existente)
        }).update({
            name,
            description,
            time,
            onDiet
        })

        reply.status(201).send("Refeição alterada com sucesso");
    })

    app.delete("/", async (request, reply) => {
        const bodySchema = z.object({
            id: z.string(),
        })

        const { id } = bodySchema.parse(request.body)

        const user = await userGetterBySession(request);

        // if(user.length === 0) reply.status(201).send("User not found") //Não precisa disso, pois já fazemos no preHandler
        // const dateHelper = new Date(time);
        try {
            const meal = await knex("meal").where({
                id, //id do meal, pra alterarmos no database
                user_id: user[0].id //confirmando que é dele (desnecessário dado o fluxo já existente)
            }).select();

            if (meal.length === 0) return reply.status(404).send("Essa Refeição não existe no banco de dados.");

            await knex("meal").where({
                id, //id do meal, pra alterarmos no database
                user_id: user[0].id //confirmando que é dele (desnecessário dado o fluxo já existente)
            }).delete();
        } catch (err) {
            console.error(err)
        }


        reply.status(201).send("Refeição excluída com sucesso.");
    })

    app.get("/", async (request) => {

        const user = await userGetterBySession(request);

        // if(user.length === 0) reply.status(201).send("User not found") //Não precisa disso, pois já fazemos no preHandler

        const meals = await knex("meal").select().where({
            user_id: user[0].id
        }).select()

        return meals;

        // reply.status(201).send("Refeição criada com sucesso");
    })

    app.get("/:id", async (request) => {

        const user = await userGetterBySession(request);

        // if(user.length === 0) reply.status(201).send("User not found") //Não precisa disso, pois já fazemos no preHandler

        const paramSchema = z.object({
            id: z.string()
        })

        const { id } = paramSchema.parse(request.params)

        const meals = await knex("meal").select().where({
            id,
            user_id: user[0].id
        }).select()

        return meals;

        // reply.status(201).send("Refeição criada com sucesso");
    })

    app.get("/statistics", async (request) => {

        const user = await userGetterBySession(request);

        const totalMeals = await knex("meal").where({
            user_id: user[0].id
        }).count('id', { as: 'total' }).first();

        const OnDietMeals = await knex.table("meal").where({
            user_id: user[0].id,
            onDiet: true
        }).count("id", { as: "onDietMealsNumber" }).first();

        const offDietMeals = await knex.table("meal").where({
            user_id: user[0].id,
            onDiet: false
        }).count("id", { as: "offDietMealsNumber" }).first();

        const allMeals = await knex.table("meal").where({
            user_id: user[0].id,
        }).select();

        let max = 0;
        let sum = 0;

        allMeals.forEach(item => {
            if (item.onDiet) {
                sum++;
                if (sum > max) max = sum;
            }
            else {
                sum = 0;
            }
        })

        return {
            totalMeals: totalMeals?.total,
            OnDietMeals: OnDietMeals?.onDietMealsNumber,
            offDietMeals: offDietMeals?.offDietMealsNumber,
            sequence: sum
        };

        // reply.status(201).send("Refeição criada com sucesso");
    })
}