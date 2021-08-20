import {NoLiveMixedWithDeferStreamRule} from "@n1ru4l/graphql-live-query";
import {applyLiveQueryJSONPatchGenerator} from "@n1ru4l/graphql-live-query-patch-json-patch";
import {InMemoryLiveQueryStore} from "@n1ru4l/in-memory-live-query-store";
import {specifiedRules} from "graphql";
import flow from "lodash.flow";

export const isDev = process.env.NODE_ENV !== "production";

export const liveQueryStore = new InMemoryLiveQueryStore();

export const validationRules = [
  ...specifiedRules,
  NoLiveMixedWithDeferStreamRule,
];

export const execute = flow(
  liveQueryStore.execute,
  applyLiveQueryJSONPatchGenerator
);
