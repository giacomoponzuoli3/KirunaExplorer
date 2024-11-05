// noinspection DuplicatedCode

import Link from "./link"
import { Stakeholder } from "./stakeholder"

/**
 * Represents a linked document.
 */
class DocLink {
    id: number
    title: string
    stakeHolders: Stakeholder[]
    scale: string
    issuanceDate: string
    type: string
    language: string | null
    pages: string | null
    description: string | null
    relatedLink: Link

    /**
     * Creates a new instance of the Document class.
     * @param id - The id of the document.
     * @param title - The title of the document.
     * @param stakeHolders - The stakeholders of the document.
     * @param scale - The scale of the document.
     * @param issuanceDate - The issuance date of the document.
     * @param type - The type of the document.
     * @param language - The language of the document.
     * @param pages - The number of pages in the document.
     * @param description - The description of the document.
     * @param relatedLink - The related Link object
     */
    constructor(
        id: number,
        title: string,
        stakeHolders: Stakeholder[],
        scale: string,
        issuanceDate: string,
        type: string,
        language: string | null = null,
        pages: string | null = null,
        description: string | null = null,
        relatedLink: Link
    ) {
        this.id = id
        this.title = title
        this.stakeHolders = stakeHolders
        this.scale = scale
        this.issuanceDate = issuanceDate
        this.type = type
        this.language = language
        this.pages = pages
        this.description = description
        this.relatedLink = relatedLink
    }
}
/**
 * Represents the type of document.
 * The values present in this enum are the only valid values for the type of document.
 */
enum Type {
    INFORMATIVE = "Informative document",
    PRESCRIPTIVE = "Prescriptive document",
    DESIGN = "Design document",
    TECHNICAL = "Technical document",
    MATERIAL = "Material effect"
}

export { DocLink, Type}
