import { FastifyRequest, FastifyReply } from "fastify";
import { knex } from "../database";

export async function checkSessionUserId(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId; //request.cookies depends on @fastify/cookie

    if (!sessionId) {
        return reply.status(401).send({
            error: "Unauthorized - you are not known by this server"
        })
    }

    const user = await knex("user").where("session_id", sessionId).select();

    if (user.length === 0) return reply.status(401).send({
        error: "Unauthorized - There is not user with your credentials"
    })

    if (user[0].session_id !== sessionId) {
        return reply.status(401).send({
            error: "Unauthorized - User not recognized | mismatch register"
        });
    }
}