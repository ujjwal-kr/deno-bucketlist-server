import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";

import {User} from '../interfaces/User.ts';

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");
const userModel = db.collection<User>("users");

export default {
    register: ({request, response}: {request: Request, response: Response}) => {},
    login: ({request, response}: {request: Request, response: Response}) => {},
    getUser: ({request, response}: {request: Request, response: Response}) => {},
    getAll: ({request, response}: {request: Request, response: Response}) => {},
    deleteUser: ({request, response}: {request: Request, response: Response}) => {}
}