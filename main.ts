import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { green, yellow } from "https://deno.land/std@0.53.0/fmt/colors.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";

import userController from "./controllers/user.controller.ts";
import taskController from "./controllers/task.controller.ts";
import listController from "./controllers/list.controller.ts";

import UserMiddleware from './middlewares/user.middleware.ts';

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");

const app = new Application();
const port: number = 8080;

const router = new Router();

router.get("/", ({ response }: any) => {
  console.log("Incoming Request");
  response.body = {
    message: "Helloworld",
  };
});

// User Routes

router
  .get("/users/:id", UserMiddleware, userController.getUser)        // Gets the list of the current user
  .get("/users/:id/tasks", UserMiddleware, userController.getTasks) // Gets the tasks of the current user
  .post("/auth/login", userController.login)
  .post("/auth/register", userController.register)

// list routes

router
  .post("/lists", UserMiddleware, listController.postItem)
  .get("/lists/:id", listController.getItem)

// task route

router
  .post("/tasks", taskController.postTask)

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`${yellow("Listening on:")} ${green(url)}`);
});

await app.listen({ port });
