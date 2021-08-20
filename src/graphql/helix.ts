import {FastifyInstance} from "fastify";
import {GraphQLError} from "graphql";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  shouldRenderGraphiQL,
} from "graphql-helix";
import {execute, isDev, liveQueryStore, validationRules} from "./common";
import {schema} from "./schema";
import {createContext} from "./schema/context";

export const helix = async (app: FastifyInstance) => {
  app.all("/graphql", async (req, res) => {
    if (isDev && shouldRenderGraphiQL(req)) {
      res.type("text/html");
      return res.send(
        renderGraphiQL({
          endpoint: "http://localhost:3000/graphql",
          subscriptionsEndpoint: "ws://localhost:3000/subscriptions",
        })
      );
    }

    const request = {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
    };

    const {operationName, query, variables} = getGraphQLParameters(request);

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
      contextFactory: () => createContext({req, liveQueryStore}),
      execute,
      validationRules,
    });

    if (result.type === "RESPONSE") {
      for (const {name, value} of result.headers) {
        res.header(name, value);
      }
      res.status(result.status).send(result.payload);
      return;
    }

    if (result.type === "MULTIPART_RESPONSE") {
      res.raw.writeHead(200, {
        Connection: "keep-alive",
        "Content-Type": 'multipart/mixed; boundary="-"',
        "Transfer-Encoding": "chunked",
      });

      req.raw.on("close", () => {
        result.unsubscribe();
      });

      res.raw.write("---");

      await result.subscribe((result) => {
        const chunk = Buffer.from(JSON.stringify(result), "utf8");
        const data = [
          "",
          "Content-Type: application/json; charset=utf-8",
          "Content-Length: " + String(chunk.length),
          "",
          chunk,
        ];

        if (result.hasNext) {
          data.push("---");
        }

        res.raw.write(data.join("\r\n"));
      });

      res.raw.write("\r\n-----\r\n");
      res.raw.end();
      return;
    }

    res.send({
      errors: [
        new GraphQLError("Subscriptions should be sent over WebSockets."),
      ],
    });
  });
};
