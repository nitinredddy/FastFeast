import { app, bootstrapApp } from "../src/app.js";

export default async function handler(req, res) {
  await bootstrapApp();
  return app(req, res);
}
