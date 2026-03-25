import {PoolConfig} from "pg";
import {DistanceStrategy} from "@langchain/community/vectorstores/pgvector";

export const config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "myuser",
    password: process.env.DB_PASSWORD ?? "ChangeMe",
    database: process.env.DB_NAME ?? "api",
  } as PoolConfig,
  tableName: "testlangchain",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
  distanceStrategy: "cosine" as DistanceStrategy,
};