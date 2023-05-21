import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  const { table, name, position, ubication, price, extra } = req.body;

  const query = {
    text: `INSERT INTO "${table}" (id, name, position, ubication, price, extra_info) VALUES (default, $1, $2, $3, $4, $5)`,
    values: [name, position, ubication, price, extra],
  };

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
