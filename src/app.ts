import fastify from "fastify";
import cookie from '@fastify/cookie';
import { userRoute } from "./routes/user"
import { mealRoute } from "./routes/meal";


export const server = fastify();

server.register(cookie); //tudo que registra é um plugin (!IMPORTANT)

server.register(mealRoute, {
    prefix: "meal"
})
server.register(userRoute, {
    prefix: "user"
});