import axios from "axios"

export const GEOCODING_BASE_URl = "http://api.openweathermap.org/geo/1.0/direct?"

export interface GeoData {
  name: string
  lat: number
  lon: number
}
export const getUbications = async (cityName: string): Promise<GeoData> => {
  const apiKey = process.env.API_KEY_GEO
  const res = await axios.get(GEOCODING_BASE_URl + `q=${cityName}&appid=${apiKey}`)
  const data = res?.data[0]
  const result: GeoData = { name: cityName, lat: data?.lat, lon: data?.lon }
  return result
}

export const filterDuplicatedGeoData = (geoDataArray: GeoData[]): GeoData[] => {
  const uniqueCoordinates = new Set()

  // Filter the array to remove duplicates
  const uniqueGeoDataArray = geoDataArray.filter(geoData => {
    const coordinate = `${geoData.lat.toFixed(6)}:${geoData.lon.toFixed(6)}`
    if (!uniqueCoordinates.has(coordinate)) {
      uniqueCoordinates.add(coordinate)
      return true
    }
    return false
  })
  return uniqueGeoDataArray
}
