import { FastifyInstance } from "fastify"
import { z } from "zod"
import { knex } from "../database"
import { checkSessionUserId } from "../middlewares/check-session-user-id"
import crypto from "node:crypto"
import { userGetterBySession } from "../util/user-getter-by-session"

function sha256(data: string) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

export async function userRoute(app: FastifyInstance) { //isso aqui é um plugin

    //app.addHook("preHandler", (request, reply) => checkSessionUserId(request, reply))

    app.get('/',
        {
            preHandler: [checkSessionUserId]
        }
        ,
        async (request) => {

            return userGetterBySession(request);
            //return reply.status(201).send() // analogamente no mysql temos que colocar INSERT () FROM RETURNING XXXX (Nem sabia desse returning)
        })

    app.post('/', async (request, reply) => {
        // aqui não tem prehandled, pois é aqui que criamos o session ID
        // {title, amount, type: credit or debit}
        const userSchema = z.object({
            name: z.string(),
            password: z.string(),
            email: z.string(),
            //type: z.enum(['credit', 'debit']),
        })
        const { name, email, password } = userSchema.parse(
            request.body,
        ) // No parse ele verifica tudo, se der algum erro ele lança uma excessão ---- não precisamos usar safeParse aqui
        // Em chamadas post, normalmente não retornamos o transactions, mas existem os http codes, que vão dizer o status da operação
        let sessionId = request.cookies.sessionId
        if (!sessionId) {
            sessionId = crypto.randomUUID() // criando o randomID pra nossa sessão
            reply.cookie('sessionId', sessionId, {
                path: '/', //determina onde o cookie será enviado; neste caso, em qualquer requisição feita ao / (todo dominio), este cookie será enviado/ se fosse /admin, seria enviado apenas para requisições feitas dentro do /admin (escopo do cookie)
                // expires: new Date('2024-12-01T08:00:00')
                maxAge: 60 * 60 * 24 * 7, // segundos //uma semana ele vai expirar //alternativa pra forma acima, que é mais chata pora colocar um Date certinho
            })
        }

        const encryptedPassword = sha256(password);  //pra não termos acesso às senhas dos usuários 

        await knex('user').insert({
            id: crypto.randomUUID(),
            name,
            email,
            password: encryptedPassword,
            session_id: sessionId,
        })

        return reply.status(201).send("Usuario criado com sucesso.") // analogamente no mysql temos que colocar INSERT () FROM RETURNING XXXX (Nem sabia desse returning)
    })
}