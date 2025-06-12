import express from "express";
import dotenv from "dotenv";
import v1Router from "./routes/v1";
import errHandlingMiddleware from "./middlewares/error.middleware";
// import { rateLimit } from "express-rate-limit";
import cors from "cors";
// const Sentry = require("@sentry/node");
// const Tracing = require("@sentry/tracing");
// import { ProfilingIntegration } from "@sentry/profiling-node";
import subscriptionRouter from "./webhooks/subscription-webhook.route";

const WEBAPP_URL = process.env.WEBAPP_URL;
const TEMP_WEBAPP_URL = process.env.TEMP_WEBAPP_URL;
const PROD_WEBAPP_URL = process.env.PROD_WEBAPP_URL;

dotenv.config();

const PORT = process.env.PORT || 6543;

const app = express();

// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   integrations: [
//     new Sentry.Integrations.Http({ tracing: true }),
//     new Sentry.Integrations.Express({ app }),
//     new ProfilingIntegration(),
//   ],
//   tracesSampleRate: 1.0,
//   profilesSampleRate: 1.0,
// });

app.use("/webhooks", subscriptionRouter);

app.use(express.json());

app.use(
  cors({
    origin: [WEBAPP_URL, TEMP_WEBAPP_URL, PROD_WEBAPP_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// app.use(limiter);

// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  if (req.headers["user-agent"] && req.headers["user-agent"].includes("ELB-HealthChecker")) {
    res.status(200).send("OK");
  } else {
    // res.redirect("https://www.google.com");
    res.status(200).send("OK");
  }
});

app.use("/v1", v1Router);

// app.use(Sentry.Handlers.errorHandler());
app.use(errHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
