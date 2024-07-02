import { config } from "./src/database"

export default config; //config tem client: 'sqlite', connection, migration, etc; só é reconhecido se fizermos isso (padrão do knex) // criar migration precisa disso, caso contrário ele dá erro npm run knex migrate:make migration_name 
