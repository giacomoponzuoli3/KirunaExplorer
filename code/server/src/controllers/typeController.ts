import { TypeDAO } from "../dao/typeDAO";
import DocType from "../models/type";
import Type from "../models/type";

class TypeController {
    private dao: TypeDAO;

    constructor() {
        this.dao = new TypeDAO();
    }

    /**
     * Retrieves all document types from the database.
     * @returns A Promise that resolves to an array of DocType objects.
     */
    async getTypes(): Promise<DocType[]> {
        return await this.dao.getTypes();
    }
    
    /**
     * Adds a document type to the database.
     * @param name the type to be added
     * @returns A Promise that resolves when the type has been added.
     */
    async addTypes(name: string): Promise<number> {
        return await this.dao.addType(name);
    }
    

}

export { TypeController }