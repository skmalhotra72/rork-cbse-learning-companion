import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { errorHandler } from "./middleware/error-handler";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

app.use("*", cors());
app.use("*", errorHandler);

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/health/supabase", async (c) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return c.json({
      status: "error",
      connected: false,
      message: "Supabase credentials not configured",
    }, 500);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("subjects").select("id").limit(1);

    if (error) {
      return c.json({
        status: "error",
        connected: false,
        message: error.message,
      }, 500);
    }

    return c.json({
      status: "ok",
      connected: true,
      message: "Supabase connection successful",
    });
  } catch (err) {
    return c.json({
      status: "error",
      connected: false,
      message: err instanceof Error ? err.message : "Unknown error",
    }, 500);
  }
});

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Backend API starting on http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/health/supabase`);

export default {
  port,
  fetch: app.fetch,
};
