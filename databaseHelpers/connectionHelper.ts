const pg = require("pg");
const CONNECTION_STRING: string = process.env.CONNECTION_STRING;
const client = new pg.Client(CONNECTION_STRING);

export default client