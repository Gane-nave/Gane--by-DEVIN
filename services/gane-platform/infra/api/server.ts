import express from "express";
import cors from "cors";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "./trpc/router.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/trpc",
  createHTTPHandler({
    router: appRouter,
    createContext: () => ({}),
  }),
);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`G.A.N.E NAV API running on http://localhost:${port}`);
});
