import {prisma} from "@app/prisma";
import {InMemoryLiveQueryStore} from "@n1ru4l/in-memory-live-query-store";
import {PrismaClient} from "@prisma/client";
import {FastifyRequest} from "fastify";

export type Context = {
  req: FastifyRequest;
  liveQueryStore: InMemoryLiveQueryStore;
  prisma: PrismaClient;
};

type CreateContextProps = {
  req: FastifyRequest;
  liveQueryStore: InMemoryLiveQueryStore;
};

type Creator = (options: CreateContextProps) => Context;

export const createContext: Creator = ({req, liveQueryStore}) => ({
  req,
  liveQueryStore,
  prisma,
});
