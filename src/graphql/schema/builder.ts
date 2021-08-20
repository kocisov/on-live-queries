import SchemaBuilder from "@giraphql/core";
import DirectivePlugin from "@giraphql/plugin-directives";
import ScopeAuthPlugin from "@giraphql/plugin-scope-auth";
import ValidationPlugin from "@giraphql/plugin-validation";
import {Context} from "./context";

type Config = {
  // DefaultFieldNullability: true;
  Context: Context;
  AuthScopes: {
    public: boolean;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
};

export const builder = new SchemaBuilder<Config>({
  // defaultFieldNullability: true,
  plugins: [DirectivePlugin, ScopeAuthPlugin, ValidationPlugin],
  authScopes: async () => ({
    public: true,
  }),
});

builder.scalarType("DateTime", {
  serialize: (date) => date.toISOString(),
  parseValue: (date: string) => new Date(date),
});
