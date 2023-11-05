export enum tables {
  cheesecakes = "cheesecakes",
  burgers = "burgers",
  restaurants = "restaurants",
  geo = "geo_ubications",
}

export interface DeleteFunctionParams {
  table: string
  id: number
  position: number
}
