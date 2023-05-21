import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { table, id, position } = req.query;
  const query = `BEGIN;
UPDATE ${table}
SET position = ${position}
WHERE id = ${id};

UPDATE ${table}
SET position = position + 1
WHERE position >=  ${position}
  AND id !=  ${id};

COMMIT;
}`;

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
