import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import client from "../databaseHelpers/connectionHelper";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  const { table } = req.query;
  const query = `SELECT * FROM "${table}"`;
  const connectionError = (err) => {
    if (err) {
      console.error("could not connect to postgres", err);
      context.res = {
        status: 500,
        body: { error: err.message },
      };
    }
  };

  await client.connect(connectionError);
  try {
    const result = await client.query(query);
    client.end();
    context.res = {
      body: result.rows,
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
