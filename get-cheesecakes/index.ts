import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const pg = require("pg");

const httpTrigger: AzureFunction = async function (context: Context) {
  const CONNECTION_STRING: string =
    "postgres://qjwwomfs:ucRpniHOvmzcFBp5w1jXr5fp35v6l_Au@mel.db.elephantsql.com/qjwwomfs";
  const query = 'SELECT * FROM "public"."cheesecake_ranking"';
  const client = new pg.Client(CONNECTION_STRING);

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
    body: result.rows[0],
  };
};

export default httpTrigger;
