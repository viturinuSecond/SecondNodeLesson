import { it, beforeAll, afterAll, beforeEach, describe, expect } from "vitest"
import request from "supertest"
import { server } from "../src/app"
import { execSync } from "node:child_process"
import { ArrayContaining } from "@vitest/expect";

describe("Testes em rotas de meals", () => {

    beforeAll(async () => {
        await server.ready() //await faz esperar
        // execSync("npm run knex migrate:unlock")
    })

    afterAll(async () => {
        await server.close();
    })

    beforeEach(() => {
        //execSync("npm run knex migrate:rollback --all");
        execSync("npm run knex migrate:latest");
    })

    it("Pegar todos os meals", async () => {

        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201)

        await request(server.server).get("/meal").set("Cookie", responseUser.get("Set-Cookie")).expect(200);
    })

    it("Pegar as estatisticas do usuário", async () => {

        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201)

        await request(server.server).post("/meal").set("Cookie", responseUser.get("Set-Cookie")).send({
            name: "Abacate e tangerina",
            description: "frutas",
            time: "2010-05-28T15:36:56.200",
            onDiet: true
        }).expect(201)

        const statisticsResponse = await request(server.server)
            .get("/meal/statistics")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .expect(200);

        expect(statisticsResponse.body).toEqual({
            totalMeals: 1,
            OnDietMeals: 1,
            offDietMeals: 0,
            sequence: 1
        })
    })

    it("Pegar dados de todos os meals", async () => {
        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201);

        await request(server.server)
            .post("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                name: "Abacate e tangerina",
                description: "frutas",
                time: "2010-05-28T15:36:56.200",
                onDiet: true
            }).expect(201);

        const mealResponse = await request(server.server)
            .get("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .expect(200)

        expect(mealResponse.body).toEqual(
            expect.arrayContaining([
                {
                    id: expect.any(String),
                    name: "Abacate e tangerina",
                    description: "frutas",
                    time: "2010-05-28T15:36:56.200",
                    onDiet: 1,
                    user_id: expect.any(String)
                }
            ])
        )
    });

    it("Pegar dados de um único meal", async () => {
        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201);

        await request(server.server)
            .post("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                name: "Abacate e tangerina",
                description: "frutas",
                time: "2010-05-28T15:36:56.200",
                onDiet: true
            }).expect(201);

        const mealResponse = await request(server.server)
            .get("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .expect(200)

        const responseMealGetter = await request(server.server)
            .get(`/meal/${mealResponse.body[0].id}`)
            .set("Cookie", responseUser.get("Set-Cookie"))
            .expect(200);

        expect(responseMealGetter.body).toEqual([
            {
                id: mealResponse.body[0].id, // Você pode ajustar este expect.any conforme necessário
                name: "Abacate e tangerina",
                description: "frutas",
                time: "2010-05-28T15:36:56.200",
                onDiet: 1,
                user_id: expect.any(String) // Você pode ajustar este expect.any conforme necessário
            }
        ]);
    });

    it("Criar um único meal", async () => {
        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201);

        await request(server.server)
            .post("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                name: "Abacate e tangerina",
                description: "frutas",
                time: "2010-05-28T15:36:56.200",
                onDiet: true
            }).expect(201);
    });

    it("Pegar dados de um único meal", async () => {
        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201);

        await request(server.server)
            .post("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                name: "Abacate e tangerina",
                description: "frutas",
                time: "2010-05-28T15:36:56.200",
                onDiet: true
            }).expect(201);

        const mealResponse = await request(server.server)
            .get("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .expect(200)

        const responseMealGetter = await request(server.server)
            .put(`/meal/${mealResponse.body[0].id}`)
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                name: "CARNE alterado no molho barbacue (TESTANDO)",
                description: "Carne deliciosa do Chicos (TESTANDO)",
                time: "2010-05-28T15:36:56.200",
                onDiet: true
            })
            .expect(201);
    });

    it("Deleta um único meal", async () => {
        const responseUser = await request(server.server)
            .post("/user")
            .send({
                name: "Thales Oliveira Almeida",
                email: "victor.almeida.ti@gmail.com",
                password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
            }).expect(201);

        await request(server.server)
            .post("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                name: "Abacate e tangerina",
                description: "frutas",
                time: "2010-05-28T15:36:56.200",
                onDiet: true
            }).expect(201);

        const mealResponse = await request(server.server)
            .get("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .expect(200)

        const responseMealGetter = await request(server.server)
            .delete("/meal")
            .set("Cookie", responseUser.get("Set-Cookie"))
            .send({
                id: mealResponse.body[0].id
            })
            .expect(201);
    });
});