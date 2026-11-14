import express from "express";
import { configDotenv } from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routers/user.routes.js";
import categoryRouter from "./routers/category.routes.js";
import productRouter from "./routers/product.routes.js";
import orderRouter from "./routers/order.routes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import cartRouter from "./routers/cart.routes.js";
import couponRouter from "./routers/coupons.routes.js";
import reviewRouter from "./routers/review.routes.js";
import adminRouter from "./routers/admin.routes.js";

import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import { webhookCheckout } from "./controllers/order.controller.js";
import startCronJobs from "./utils/cronJobs.js";

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve('./swagger-output.json'), 'utf-8')
);

configDotenv();
const app = express();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookCheckout,
);

// MiddleWares
app.use(express.json({ limit: "10kb" }));

app.use(helmet());

// app.use(mongoSanitize());

app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);

  mongoSanitize.sanitize(req.params);

  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

app.use("/", limiter);

app.use("/uploads", express.static("uploads"));

//APIs
app.use("/users", userRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/coupon", couponRouter);
app.use("/reviews", reviewRouter);
app.use("/admin", adminRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});


app.use(errorMiddleware);

connectDB();

startCronJobs();


if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

export default app;
