import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UPDATE_AFTER_ADD_ITEM, UPDATE_POSITION } from "../databaseHelpers/queries"
import manageAuthorization, { ManageAuthorizationRes } from "../authHelper/jsonWebToken"
const pg = require("pg")

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const { table, id, position, name } = req.body
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
    await client.query(UPDATE_POSITION(table, position, id, name))
    await client.query(UPDATE_AFTER_ADD_ITEM(table, position, id))
    client.end()

    context.res = {
      body: JSON.stringify(`Updated item with id: ${id}`),
    }
  } catch (error) {
    console.error("Error updating items.", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: "Error in the query" },
    }
  }
}

export default httpTrigger
