import { z } from "zod"
import { config } from "dotenv" //basicamente, pelo que percebio, configura qual variável de ambiente devemos importar (pois nos dá a variável config pra colocarmos condicional) --- Aparentemente é apenas isso, pois process.env.NODE_ENV está sendo acessado sem necessidade dela, outra coisa importante a ser notado é que process é utilizado em todos os lugares, inclusiove para usarmos os streams de stdin e stdout

if (process.env.NODE_ENV === 'test') {
  // se eu executar um framework de teste como vitest, automaticamente o framework preenche a variável de ambiente com test, por isso cai aqui
  config({ path: '.env.test' }) // lá no env.test, só estou reforçando que NODE_ENV é test, pois isso já écitado ao utilizar um framework de teste, como vitast
} else {
  config(/* { path: '.env' } */) // se não colocar o path, ele pega por default
}
// process.env.DATABASE_URL

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_CLIENT: z.enum(['sqlite3', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333), // render já envia PORT como development, pelo que entendi, em ambiente de produção, mas envia uma string por default, por isso usamos o coerce, pra coagir a transformação dessa String em Number. A porta erscolhida também é feita pela nuvem (provider), logo, trataremos a variavel enviada pelo RENDER lá na nuvem || Não importa o valor recebido da nuvem no PORT, transforme isso em Number; caso isso não consigo ser transformado, coloque como default 3333, pois é um number escolhido por nós(vai dar problema na nuvem, pois essa porta póde estar sendo utilizada por outro projeto ou não ter permissão pra usa-la (caso disponivel))  
})

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format()); // mostra o erro formatado para melhor compreensão
  throw new Error('Invalid environment variables');
}

export const env = _env.data;

