
class Coordinate {
    id: number
    point_order: number
    latitude: number
    longitude: number

    constructor(id: number, point_order: number, latitude: number, longitude: number) {
        this.id = id
        this.point_order = point_order
        this.latitude = latitude
        this.longitude = longitude
    }
}
export default Coordinate