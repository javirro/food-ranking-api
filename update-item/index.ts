import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UPDATE_AFTER_ADD_ITEM, UPDATE_POSITION } from "../databaseHelpers/queries"
import manageAuthorization, { ManageAuthorizationRes } from "../authHelper/jsonWebToken"
import { checkTableIsValid } from "../databaseHelpers/dbHelper"
const pg = require("pg")

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const { table, id, position: newPosition, name } = req.body
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
    if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")
    try {
      await client.query("BEGIN")

      // Step 1: Fetch the original position
      const res = await client.query(`SELECT position FROM ${table} WHERE id = $1`, [id])
      const originalPosition = res.rows[0].position

      // Step 2: Update the position of the target cheesecake
      await client.query(`UPDATE ${table}  SET position = $1 WHERE id = $2`, [newPosition, id])

      // Step 3: Adjust the positions of the other cheesecakes
      if (newPosition < originalPosition) {
        await client.query(`UPDATE ${table}  SET position = position + 1 WHERE id != $1 AND position >= $2 AND position < $3`, [id, newPosition, originalPosition])
      } else if (newPosition > originalPosition) {
        await client.query(`UPDATE ${table} SET position = position - 1 WHERE id != $1 AND position <= $2 AND position > $3`, [id, newPosition, originalPosition])
      }

      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
    context.res = {
      body: JSON.stringify(`Updated item with id: ${id}`),
    }
  } catch (error) {
    console.error("Error updating items.", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: `Error in the query. ${error.message}` },
    }
  }
}

export default httpTrigger
