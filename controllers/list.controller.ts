import { Request, Response, Status } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

import { ListItem } from "../interfaces/ListItem.ts";

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");
const listModel = db.collection<ListItem>("lists");

export default {
  getItem: async (
    { request, response, params }: {
      request: Request;
      response: Response;
      params: { id: string };
    },
  ) => {
    const item: ListItem | null = await listModel.findOne({ id: params.id });
    console.log(item);
    if (!item) {
      response.status = Status.NotFound;
      response.body = {
        message: "Not found",
      };
    } else {
      response.body = {
        item,
      };
    }
  },
  postItem: async (
    { request, response }: { request: Request; response: Response },
  ) => {
    const jwt = request.headers.get("authorization")!;
    const body: ListItem = await request.body().value;
    const data: any = await validateJwt(
      { jwt, key: "secret", algorithm: "HS256" },
    );
    if (body.userId !== data.payload.id) {
      response.status = Status.Unauthorized;
      response.body = {
        message: "Unauthoized",
      };
    } else {
      const finalList: ListItem = {
        text: body.text,
        id: v4.generate(),
        userId: body.userId,
        dateCreated: Date.now(),
        completed: false,
      };
      await listModel.insertOne(finalList);
      response.body = {
        message: "created",
      };
    }
  }
};
