import { checkTableIsValid } from "./dbHelper"

// Table cannot be set as parameter in the query. We must use template literal, but to avoid sql injection we verify that table value is valid value.
export const NEXTVAL = () => `SELECT NEXTVAL('cheesecakes_id_seq')`

export const DELETE_ITEM = (table: string, deletedId: number) => {
  if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")
  const query = {
    text: `DELETE FROM ${table} WHERE id = $1`,
    values: [deletedId],
  }
  return query
}

export const UPDATE_AFTER_DELETE = (table: string, positionDeleted: number) => {
  if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")
  const query = {
    text: `UPDATE ${table} SET position= position-1 WHERE position > $1`,
    values: [positionDeleted],
  }
  return query
}

export const UPDATE_POSITION = (table: string, position: number, id: number, name: string) => {
  if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")
  const query = {
    text: `UPDATE ${table} SET position= $1, name = '$2' WHERE id = $3`,
    values: [position, name, id],
  }
  return query
}

export const UPDATE_AFTER_ADD_ITEM = (table: string, positionAdded: number, idAdded: number) => {
  if (!checkTableIsValid(table)) throw Error("Table name invalid. Avoid sql injection.")
  const query = {
    text: `UPDATE ${table} SET position = position +1 WHERE position >= $1 AND id <> $2`,
    values: [positionAdded, idAdded],
  }
  return query
}

export const INSERT_UBICATION = (name: string, lat: number, lon: number) => {
  return {
    text: "INSERT INTO geo_ubications  (id, ubication, lat, lon) VALUES (default, $1, $2, $3)",
    values: [name, lat, lon],
  }
}

export const GET_UBICATION = (name: string) => {
  const query = {
    text: "SELECT lat, lon FROM geo_ubications where ubication = $1",
    values: [name],
  }
  return query
}
