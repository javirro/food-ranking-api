export const NEXTVAL = () => `SELECT NEXTVAL('cheesecakes_id_seq')`;
export const DELETE_ITEM = (table, deletedId) =>
  `DELETE FROM "${table}" WHERE id = ${deletedId}`;
export const UPDATE_AFTER_DELETE = (table, positionDeleted) =>
  `UPDATE "${table}" SET position= position-1 WHERE position > ${positionDeleted}`;
export const UPDATE_POSITION = (table, position, id, name) => {
  return `UPDATE "${table}" SET
  position= ${position},
  name = '${name}' WHERE id = ${id} `;
};

export const UPDATE_AFTER_ADD_ITEM = (table, positionAdded, idAdded) =>
  `UPDATE "${table}" SET
  position = position +1 WHERE position >= ${positionAdded} AND id <> ${idAdded}`;

export const UPDATE_POSITION_AND_INCREASE_LOWER_POSITIONS = (
  table,
  updatedId,
  positionModified
) =>
  `RETURNING *
   UPDATE "${table}" SET position=  position +1 WHERE position > ${positionModified} AND id <> ${updatedId}`;
