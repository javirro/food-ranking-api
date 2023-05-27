import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  const { table } = req.query;
  const query = `SELECT * FROM "${table}" ORDER BY position`;

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
    const result = await client.query(query);
    client.end();
    context.res = {
      body: result.rows,
    };
  } catch (error) {
    console.log(error)
    client.end();
    context.res = {
      status: 404,
      body: { error: "Error in the query" },
    };
  }
};

export default httpTrigger;
