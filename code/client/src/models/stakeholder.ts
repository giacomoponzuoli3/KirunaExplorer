/**
 * Represents a document.
 */
class Stakeholder {
    id: number
    name: string
    category: string
    

    /**
     * Creates a new instance of the Stakeholder class.
     * @param id - The id of the stakeholder.
     * @param name - The name of the stakeholder.
     * @param category - The category of the stakeholder.
     */
    constructor(
        id: number,
        name: string,
        category: string,
    ) {
        this.id = id
        this.name = name
        this.category = category
    }
}



export { Stakeholder }