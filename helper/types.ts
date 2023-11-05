export enum tables {
  cheesecakes = "cheesecakes",
  burgers = "burgers",
  restaurants = "restaurants",
}

export interface DeleteFunctionParams {
  table: string
  id: number
  position: number
}
