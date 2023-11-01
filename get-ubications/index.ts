import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { GeoData, filterDuplicatedGeoData, getUbications } from "../helper/getUbications"
import { GET_UBICATION, INSERT_UBICATION } from "../databaseHelpers/queries"
import { GET_HEADER } from "../helper/getHeader"
const pg = require("pg")
require("dotenv").config()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const table = req.query.table

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
  let tableResult
  try {
    const query = `SELECT * FROM "${table}" ORDER BY position`
    tableResult = (await client.query(query)).rows
  } catch (error) {
    console.log("Error getting data from ", table, ". ", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: "Error in the query to get ranking results" },
    }
  }

  try {
    // Having problems with the names
    const cities: string[] = tableResult.map(item => item.ubication?.trim())
    const citiesWIthoutDuplicated: string[] = [...new Set(cities)] as string[]

    // Get previous data from Database for all the cities
    const bdUbications: GeoData[] = []
    for (const city of citiesWIthoutDuplicated) {
      const queryResult = (await client.query(GET_UBICATION(city))).rows
      if (queryResult.length > 0) bdUbications.push({ name: city, lat: queryResult[0].lat, lon: queryResult[0].lon })
      else bdUbications.push({ name: city, lat: undefined, lon: undefined })
    }

    // Check if All the required info is available in BD
    const bdUbicationWithoutData: GeoData[] = bdUbications.filter(data => !data?.lon || !data?.lat)
    if (bdUbicationWithoutData.length === 0) {
      client.end()
      context.res = {
        headers: GET_HEADER,
        body: bdUbications,
      }
      return
    }

    // Get the data for cities which are not included in DB
    const geoDataPromise = bdUbicationWithoutData.map(async city => await getUbications(city.name))
    const geoDataNotInDb: GeoData[] = await Promise.all(geoDataPromise)

    // Get cities which must be added to database
    const citiesToAddToDb: GeoData[] = geoDataNotInDb.filter(item => item.lon !== undefined && item.lat !== undefined)
    if (citiesToAddToDb.length === 0) {
      client.end()
      context.res = {
        headers: GET_HEADER,
        body: bdUbications.filter(data => data?.lon && data?.lat),
      }
      return
    }

    // Add the new data to databse
    for (let i = 0; i < citiesToAddToDb.length; i++) {
      try {
        await client.query(INSERT_UBICATION(citiesToAddToDb[i].name, citiesToAddToDb[i]?.lat, citiesToAddToDb[i]?.lon))
      } catch (e) {
        console.log("Error adding to db", e.message)
        continue
      }
    }
    // Concat previous geo data with new one
    const allGeoData: GeoData[] = bdUbications.concat(citiesToAddToDb)
    client.end()
    console.log("All geo Data", allGeoData)
    context.res = {
      headers: GET_HEADER,
      body: allGeoData.filter(data => data?.lon && data?.lat),
    }
  } catch (error) {
    console.log("Error getting ubications. ", error.message)
    client.end()
    context.res = {
      status: 404,
      body: { error: "Error getting ubications" },
    }
  }
}

export default httpTrigger
