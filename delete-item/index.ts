import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DELETE_ITEM, UPDATE_AFTER_DELETE } from "../databaseHelpers/queries";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { table, id, position } = req.query;


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
    await client.query(DELETE_ITEM(table,id));
    await client.query(UPDATE_AFTER_DELETE(table, position))
    client.end();

    context.res = {
      body: JSON.stringify(`Deleted item with id: ${id}`),
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
