import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { table, name, position } = req.body;
  const query = `DELETE FROM "${table}" WHERE name = "${name}" and position = "${position}"`;


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
      body: "Done",
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
