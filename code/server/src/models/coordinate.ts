
class Coordinate {
    id: number
    point_order: number
    latitude: number
    longitude: number
    municipality_area: number

    constructor(id: number, point_order: number, latitude: number, longitude: number, municipality_area: number) {
        this.id = id
        this.point_order = point_order
        this.latitude = latitude
        this.longitude = longitude
        this.municipality_area = municipality_area
    }
}
export default Coordinate