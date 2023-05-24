import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {UPDATE_POSITION_AND_INCREASE_LOWER_POSITIONS} from "../databaseHelpers/queries"
const pg = require("pg");


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { table, id, position } = req.query;
  const query = UPDATE_POSITION_AND_INCREASE_LOWER_POSITIONS(table,id, position)

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
    await client.query(query);
    client.end();

    context.res = {
      body: JSON.stringify(`Updated item with id: ${id}`),
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
