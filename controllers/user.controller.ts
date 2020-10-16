import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts";


import {User} from '../interfaces/User.ts';

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");

const db = client.database("bucketlist");
const userModel = db.collection<User>("users");

export default {
    register: async ({request, response}: {request: Request, response: Response})  => {
        const body: User = await request.body().value;
        const email = body.email;
        const exists = await userModel.findOne({email});
        if(exists) { response.body={message: "User Exists"} }
        else{
            const user: User = {
                name: body.name,
                id: v4.generate(),
                email,
                password: body.password,
            }
            await userModel.insertOne({ id: user.id, name: user.name, email, password: user.password })
            response.body = {
                user
            }
        }
    },
    login: async ({request, response}: {request: Request, response: Response}) => {
        const key = "secret";
        const body: User = await request.body().value;
        const email = body.email;
        const password = body.password;
        const exists = await userModel.findOne({email});
        if (exists) {
            if (password !== exists.password) {
                response.body = { message: "Wrong Password" }
            } else {
                const payload = {
                    email,
                    exp: setExpiration(2593000),
                    id: exists.id
                }
                const header: Jose = {
                    alg: "HS256",
                    typ: "JWT"
                };
                const token = await makeJwt({key, header, payload})
                response.body = {
                    user: exists,
                    token
                }
            }
        }else {
            response.body = { message: "Cant find user" }
        }
    },
    getUser: ({request, response}: {request: Request, response: Response}) => {},
    getAll: ({request, response}: {request: Request, response: Response}) => {},
    deleteUser: ({request, response}: {request: Request, response: Response}) => {}
}