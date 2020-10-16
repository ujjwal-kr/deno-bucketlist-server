import { Request, Response, Status } from "https://deno.land/x/oak/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";

const UserMiddleware = async ({request, response}: {request: Request, response: Response}, next: Function) => {
    const jwt = request.headers.get("authorization")!;
    if((await validateJwt({ jwt, key: "secret", algorithm: "HS256"  })).isValid) {
    next()
    } else {
        response.status = Status.Unauthorized;
        response.body = {
            message: "Not authorized"
        };
    }
}

export default UserMiddleware;