import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import client from "../databaseHelpers/connectionHelper";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
      const query = {
        text: "INSERT INTO cheesecake_ranking (id, restaurant, position) VALUES (default, $1, $2)",
        values: ["Madre Javi", "3"],
      };

     // const query = 'INSERT INTO cheesecake_ranking (id, restaurant, position) VALUES (default, "bar cremaet valencia", 2)';
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
          const result = await client.query(query);
          console.log(result.rows[0])
          client.end();

// req.query.name or req.body.name

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "done"
    };

};

export default httpTrigger;