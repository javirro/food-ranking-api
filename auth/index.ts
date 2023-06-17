import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import manageAuthorization, {
  ManageAuthorizationRes,
} from "../authHelper/jsonWebToken";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const header: any =req.headers["authorization"]

  console.log("header", header)
  let authData: ManageAuthorizationRes;

  try {
    authData = manageAuthorization(header);
  } catch (err) {
    console.log("AUTH ERROR.", err.message);
    context.res = {
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': "*",
      },
      body: { error: err.message },
    };
  }
  console.log("AUTHDATA", authData.token);
  context.res = {
    // status: 200, /* Defaults to 200 */
    headers: {
        'Access-Control-Allow-Origin': "*",
    },
    body: JSON.stringify(authData.token),
  };
};

export default httpTrigger;
