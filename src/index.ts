import "dotenv/config";
import fastify from "fastify";
import cors from "fastify-cors";
import helmet from "fastify-helmet";
import ratelimit from "fastify-rate-limit";
import websocket from "fastify-websocket";
import {subscribe} from "graphql";
import {makeHandler} from "graphql-ws/lib/use/fastify-websocket";
import {execute, isDev} from "./graphql/common";
import {helix} from "./graphql/helix";
import {schema} from "./graphql/schema";
import {createContext} from "./graphql/schema/context";

const main = async () => {
  const app = await fastify({logger: true});

  await app.register(helmet, {
    contentSecurityPolicy: isDev ? false : undefined,
  });

  // for Public API
  await app.register(cors, {
    credentials: true,
  });

  await app.register(ratelimit, {
    max: 128,
    timeWindow: "1 minute",
    global: false,
  });

  await app.register(websocket, {
    options: {
      maxPayload: 256 * 1024,
      clientTracking: true,
    },
  });

  app.setNotFoundHandler((_req, res) => {
    res.send("Ok.");
  });

  await app.register(helix);

  app.route({
    url: "/subscriptions",
    method: "GET",
    handler: (_req, res) => {
      res.send("Ok.");
    },
    wsHandler: makeHandler({
      schema,
      context: createContext,
      execute,
      subscribe,
    }),
  });

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0").catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
};

main();
