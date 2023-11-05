import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { DELETE_ITEM, UPDATE_AFTER_DELETE } from "../databaseHelpers/queries"
import manageAuthorization, { ManageAuthorizationRes } from "../authHelper/jsonWebToken"
import { DeleteFunctionParams } from "../helper/types"
const pg = require("pg")

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const { table, id, position }: DeleteFunctionParams = req.query as any
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
      console.error("Internal error. Could not connect to postgres.", err.message)
      context.res = {
        status: 500,
        body: { error: "Internal error" },
      }
    }
  }
  const CONNECTION_STRING: string = process.env.CONNECTION_STRING
  const client = new pg.Client(CONNECTION_STRING)
  await client.connect(connectionError)

  try {
    await client.query(DELETE_ITEM(table, id))
    await client.query(UPDATE_AFTER_DELETE(table, +position))
    client.end()

    context.res = {
      body: JSON.stringify("authData.token"),
    }
  } catch (error) {
    console.error("Error deleting item.", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: "Error in the query" },
    }
  }
}

export default httpTrigger
