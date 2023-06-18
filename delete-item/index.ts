import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DELETE_ITEM, UPDATE_AFTER_DELETE } from "../databaseHelpers/queries";
import manageAuthorization, { ManageAuthorizationRes } from "../authHelper/jsonWebToken";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { table, id, position } = req.query;
  const tokenSecret: string = req.headers["token"];

  let authData: ManageAuthorizationRes;

  try {
    authData = manageAuthorization(undefined, tokenSecret);
  } catch (err) {
    console.log("AUTH ERROR.", err.message);
    context.res = {
      status: 403,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: { error: err.message },
    };
  }

  const connectionError = (err) => {
    if (err) {
      console.error("could not connect to postgres", err);
      context.res = {
        status: 500,
        body: { error: err.message },
      };
    }
  };
  const CONNECTION_STRING: string = process.env.CONNECTION_STRING;
  const client = new pg.Client(CONNECTION_STRING);
  await client.connect(connectionError);

  try {
    await client.query(DELETE_ITEM(table, id));
    await client.query(UPDATE_AFTER_DELETE(table, position));
    client.end();

    context.res = {
      body: JSON.stringify("authData.token"),
    };
  } catch (error) {
    client.end();
    context.res = {
      status: 404,
      body: { error: "Error in the query" },
    };
  }
};

export default httpTrigger;
