import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import manageAuthorization, {
  ManageAuthorizationRes,
} from "../authHelper/jsonWebToken";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  const authHeader: string =req.headers["authorization"]
  let authData: ManageAuthorizationRes;

  try {
    authData = manageAuthorization({ authHeader });
  } catch (err) {
    console.log("AUTH ERROR.", err.message);
    context.res = {
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': "*",
      },
      body: { error: err.message },
    };
    return
  }
  context.res = {
    headers: {
        'Access-Control-Allow-Origin': "*",
    },
    body: JSON.stringify(authData.token),
  };
};

export default httpTrigger;
