import { knex as setupKnex, Knex } from "knex";
import { env } from "./env";


export const config: Knex.Config = { //precisa ser exportado no arquivo de config knexfile.ts
  client: env.DATABASE_CLIENT, // or 'better-sqlite3'
  connection:
    env.DATABASE_CLIENT === "sqlite3"
      ? {
        filename: env.DATABASE_URL
      }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
};

export const knex = setupKnex(config);