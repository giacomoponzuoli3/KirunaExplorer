class Resources {
    id: number;
    idDoc: number;
    name: string;
    data: Uint8Array | null; // Per rappresentare dati binari (es. PDF, immagini)
    uploadTime: Date; // Per rappresentare il timestamp
    constructor(id: number, idDoc: number, name: string, data: Uint8Array | null = null, uploadTime: Date) {
        this.id = id;
        this.idDoc = idDoc;
        this.name = name;
        this.data = data;
        this.uploadTime = uploadTime;
    }
}
export default Resources;