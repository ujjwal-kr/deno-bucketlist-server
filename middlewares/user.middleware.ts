import { Context, Status } from "https://deno.land/x/oak/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";

const UserMiddleware = async (
  ctx: Context,
  next: Function,
) => {
  const jwt = ctx.request.headers.get("authorization")!;
  const data: any = await validateJwt({ jwt, key:"secret", algorithm: "HS256" })
  if (data.isValid) {
    next();
  }
  else {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = {
      message: "Not authorized",
    };
  }
};

export default UserMiddleware;