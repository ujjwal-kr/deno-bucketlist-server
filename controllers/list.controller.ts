import { Request, Response, Status } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";

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
    const jwt = request.headers.get("authorization")!;
    const data: any = validateJwt({ jwt, key: "secret", algorithm: "HS256" });
    if (data.id !== params.id) {
      response.status = Status.Unauthorized;
      response.body = {
        message: "Unauthorized",
      };
    } else {
      const item: ListItem | null = await listModel.findOne({ id: params.id });
      if (!item) {
        response.status = Status.NotFound;
        response.body = {
          message: "Not Found",
        };
      } else {
        response.body = {
          item,
        };
      }
    }
  },
  postItem: (
    { request, response }: { request: Request; response: Response },
  ) => {
  },
  editItem: (
    { request, response }: { request: Request; response: Response },
  ) => {},
  deleteItem: (
    { request, response }: { request: Request; response: Response },
  ) => {},
};
