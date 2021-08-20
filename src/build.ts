import {build} from "esbuild";
import {dependencies} from "../package.json";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node16",
  outfile: "dist/index.js",
  external: Object.keys(dependencies),
  minify: process.env.NODE_ENV === "production",
});
