import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts";


import {User} from '../interfaces/User.ts';

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");
const userModel = db.collection<User>("users");

export default {
    register: async ({request, response}: {request: Request, response: Response})  => {
        const body: User = await request.body().value
        const email = body.email;
        const exists = await userModel.findOne({email});
        if(exists) { response.body={message: "User Exists"} }
        else{
            const user: User = {
                name: body.name,
                email: body.email,
                password: body.password,
            }
            const newUser = await userModel.insertOne({ name: user.name, email: user.email, password: user.password })
            response.body = {
                user
            }
        }
    },
    login: ({request, response}: {request: Request, response: Response}) => {},
    getUser: ({request, response}: {request: Request, response: Response}) => {},
    getAll: ({request, response}: {request: Request, response: Response}) => {},
    deleteUser: ({request, response}: {request: Request, response: Response}) => {}
}