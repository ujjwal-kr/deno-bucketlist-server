import { Request, Response, Status } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import {
  Jose,
  makeJwt,
  setExpiration,
} from "https://deno.land/x/djwt/create.ts";

import { User } from "../interfaces/User.ts";
import { ListItem } from "../interfaces/ListItem.ts";

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");
const userModel = db.collection<User>("users");
const listModel = db.collection<ListItem>("lists");

export default {
  register: async (
    { request, response }: { request: Request; response: Response },
  ) => {
    const body: User = await request.body().value;
    const email = body.email;
    const exists = await userModel.findOne({ email });
    if (exists) {
      response.status = Status.AlreadyReported;
      response.body = { message: "User Exists" };
    } else {
      const user: User = {
        name: body.name,
        id: v4.generate(),
        email,
        password: body.password,
      };
      await userModel.insertOne(
        { id: user.id, name: user.name, email, password: user.password },
      );
      response.status = Status.OK;
      response.body = { user };
    }
  },
  login: async (
    { request, response }: { request: Request; response: Response },
  ) => {
    const key = "secret";
    const body: User = await request.body().value;
    const email = body.email;
    const password = body.password;
    const exists = await userModel.findOne({ email });
    if (exists) {
      if (password !== exists.password) {
        response.status = Status.BadRequest;
        response.body = { message: "Wrong Password" };
      } else {
        const payload = {
          email,
          exp: setExpiration(2593000),
          id: exists.id,
        };
        const header: Jose = {
          alg: "HS256",
          typ: "JWT",
        };
        const token = await makeJwt({ key, header, payload });
        response.body = {
          user: exists,
          token,
        };
      }
    } else {
      response.status = Status.NotFound;
      response.body = { message: "Cant find user" };
    }
  },
  getUser: async (
    { request, response, params }: {
      request: Request;
      response: Response;
      params: { id: string };
    },
  ) => {
    const user: User | null = await userModel.findOne({ id: params.id });
    if (!user) {
      response.status = Status.NotFound;
      response.body = { message: "Not  Found" };
    } else {
      const lists: ListItem[] | null = await listModel.find(
        { userId: params.id },
      );
      if (!lists) {
        response.status = Status.NotFound;
        response.body = { message: "Not Found" };
      } else {
        response.body = {
          user,
          lists,
        };
      }
    }
  }
};
