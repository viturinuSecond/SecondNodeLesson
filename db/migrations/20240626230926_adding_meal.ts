import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("meal", (table) => {
        table.uuid("id").notNullable().primary();
        table.string("name").notNullable();
        table.string("description").notNullable;
        table.timestamp("time").defaultTo(knex.fn.now);
        table.boolean("onDiet").defaultTo(true).notNullable();
        table.uuid("user_id").notNullable();
        table.foreign("user_id").references('user.id'); //reference
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("meal");
}

