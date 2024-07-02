import { server } from "./app"
import { env } from "./env"

server
    .listen({
        port: env.PORT,
    })
    .then(() => console.log('Server running - HTTP from node behind the scene'))
    .catch((error) => {
        console.log(error)
    })