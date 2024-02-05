import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { execSync } from "node:child_process";
import { DomainEvents } from "@/core/events/domain-events";
import { Redis } from "ioredis";
import { envSchema } from "@/infra/env/env";

config({ path: ".env", override: true });
config({ path: ".env.test", override: true });

const env = envSchema.parse(process.env);

const prisma = new PrismaClient();
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
});
const schemaId = randomUUID();

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error("Please provider a DATABASE_URL environment variable.");
  }
  const url = new URL(env.DATABASE_URL);
  url.searchParams.set("schema", schemaId);

  return url.toString();
}

beforeAll(async () => {
  // Gerar um schema aleatório
  const databaseURL = generateUniqueDatabaseURL(schemaId);

  // Sobrescrever a variavel de ambiente com a nova URL de conexão para os teste
  process.env.DATABASE_URL = databaseURL;

  // Evitar disparo dos eventos de dominio nos teste E2E
  DomainEvents.shouldRun = false;

  // Apagar dados do cache no redis antes dos testes
  await redis.flushdb();

  // Executar as migrations do prisma no novo esquema gerado
  execSync("npx prisma migrate deploy");
});

afterAll(async () => {
  // REMOVER BANCO DE DADOS ISOLADO DOS TESTE E2E
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
