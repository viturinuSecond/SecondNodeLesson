import { FastifyRequest } from "fastify";
import { knex } from "../database";

export async function userGetterBySession(req: FastifyRequest) {
    const sessionId = req.cookies.sessionId;

    const user = await knex("user").where({
        session_id: sessionId
    }).select(); //vai encontrar, já foi feito teste pelo preHandler

    return user;
} 