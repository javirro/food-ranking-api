import { tables } from "../helper/types"

// Check if the table is inside the valid enum. Avoid sql injection.
export const checkTableIsValid = (table: string): boolean => {
  return Object.values(tables).includes(table as tables)
}
