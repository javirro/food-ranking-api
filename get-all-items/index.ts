import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { checkTableIsValid } from "../databaseHelpers/dbHelper"
const pg = require("pg")
require("dotenv").config()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  const { table } = req.query
  if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")
  const query = `SELECT * FROM "${table}" ORDER BY position`

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
  const client = new pg.Client({ connectionString: CONNECTION_STRING })
  await client.connect(connectionError)
  try {
    const result = await client.query(query)
    const data= result.rows
    // const dataPositionFixed = data.map((item, index) => ({...item, position: index + 1}))
    client.end()
    context.res = {
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
      },
      body: data,
    }
  } catch (error) {
    console.error("Error getting items.", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: "Error in the query" },
    }
  }
}

export default httpTrigger;
