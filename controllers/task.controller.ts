import { Request, Response, Status } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

import {Task} from '../interfaces/Task.ts';
const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");
const taskModel = db.collection<Task>("tasks");

export default {
  getTask: async (
    { request, response, params }: {
      request: Request;
      response: Response;
      params: { id: string };
    },
  ) => {

  },
  postTask: async (
    { request, response }: { request: Request; response: Response },
  ) => {
    const jwt = request.headers.get("authorization")!;
    const body: Task = await request.body().value; 

    const data: any = await validateJwt({ jwt, key: "secret", algorithm: "HS256" });
    if (body.userId !== data.payload.id) {
        response.status = Status.Unauthorized;
        response.body = {
            message: "Unauthorized"
        }
    } else {
        const task: Task = {
            id: v4.generate(),
            description: body.description,
            title: body.description,
            userId: body.userId
        }
        await taskModel.insertOne(task)
        response.body = {
            message: "Saved"
        }
    }
  }
};
