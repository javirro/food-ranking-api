import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UPDATE_AFTER_ADD_ITEM } from "../databaseHelpers/queries"
import { checkTableIsValid } from "../databaseHelpers/dbHelper"
const pg = require("pg")

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  const { table, name, position, ubication, price, extra } = req.body

  if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")

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

  const higherId = await client.query(`SELECT MAX(id) FROM ${table}`)
  const nextId = higherId.rows[0].max + 1
  try {
    const query = {
      text: `INSERT INTO ${table} (id, name, position, ubication, price, extra_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [nextId, name, position, ubication, price, extra],
    }

    const result = await client.query(query)

    const addedId: number = result.rows[0].id
    await client.query(UPDATE_AFTER_ADD_ITEM(table, +position, addedId))
    client.end()
    context.res = {
      body: JSON.stringify("Done"),
    }
  } catch (error) {
    console.error("Error Adding item.", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: `Error in the query.  Id: ${nextId} - ${error.message}` },
    }
  }
}

export default httpTrigger
