import { AzureFunction, Context } from "@azure/functions";
import client from "../databaseHelpers/connectionHelper";


const httpTrigger: AzureFunction = async function (context: Context) {
  const query = 'SELECT * FROM "cheesecake_ranking"';
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
  const result = await client.query(query)
  client.end()

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: (result.rows),
  };
};

export default httpTrigger;
