import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UPDATE_AFTER_ADD_ITEM, UPDATE_POSITION } from "../databaseHelpers/queries"
import manageAuthorization, { ManageAuthorizationRes } from "../authHelper/jsonWebToken"
const pg = require("pg")

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const { table, id, position } = req.body
  const tokenSecret: string = req.headers["token"]

  let authData: ManageAuthorizationRes

  try {
    authData = manageAuthorization({ tokenSecret })
  } catch (err) {
    console.log("AUTH ERROR.", err.message)
    context.res = {
      status: 403,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: { error: err.message },
    }
    return
  }
  const connectionError = err => {
    if (err) {
      console.error("could not connect to postgres", err)
      context.res = {
        status: 500,
        body: { error: err.message },
      }
    }
  }
  const CONNECTION_STRING: string = process.env.CONNECTION_STRING
  const client = new pg.Client(CONNECTION_STRING)
  await client.connect(connectionError)

  try {
    const res = await client.query(
      `DO $$
      DECLARE
          target_id INTEGER := $1;
          new_position INTEGER := $2;
          old_position INTEGER;
      BEGIN
          SELECT position INTO old_position
          FROM ${table}
          WHERE id = target_id;

          IF old_position IS NOT NULL THEN
              IF new_position > old_position THEN
                  UPDATE ${table}
                  SET position = position - 1
                  WHERE position > old_position AND position <= new_position;
              ELSIF new_position < old_position THEN
                  UPDATE ${table}
                  SET position = position + 1
                  WHERE position >= new_position AND position < old_position;
              END IF;
              
              UPDATE ${table}
              SET position = new_position
              WHERE id = target_id;
          END IF;
      END $$;`,
      [id, position]
    )

    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    client.end()
    context.res = {
      status: 404,
      body: { error: "Error in the query" },
    }
    return
  } finally {
    client.release()
  }

  context.res = {
    body: JSON.stringify(`Updated item with id: ${id}`),
  }
}

export default httpTrigger
