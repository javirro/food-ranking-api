export const DELETE_ITEM_AND_UPDATE_RANKING = (table, deletedId, positionDeleted) =>
  `DELETE FROM "${table}" WHERE id = ${deletedId}
  UPDATE "${table}" SET position= position-1 WHERE position > ${positionDeleted}`

export const UPDATE_POSITION_AND_INCREASE_LOWER_POSITIONS = (
    table,
    updatedId,
    positionModified
  ) =>
  `UPDATE "${table}" SET position= ${positionModified} WHERE id = ${updatedId} RETURNING *
   UPDATE "${table}" SET position=  position +1 WHERE position > ${positionModified} AND id <> ${updatedId}`