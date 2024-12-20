import { Stakeholder } from "../models/stakeholder";
import LatLng from "../interfaces";
const baseURL = "http://localhost:3001/kiruna/"

/** ------------------- Access & User APIs ------------------------ */

async function login(username: string, password: string) {
    let response = await fetch(baseURL + "sessions", {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password },)
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message

        throw new Error("Something went wrong")
    }
}

async function logOut() {
    await fetch(baseURL + 'sessions/current', { method: 'DELETE', credentials: "include" });
}

async function getUserInfo() {
    const response = await fetch(baseURL + 'sessions/current', { credentials: "include" })
    if (response.ok) {
        return await response.json();
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function register(username: string, name: string, surname: string, password: string, role: string) {
    let response = await fetch(baseURL + "sessions/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, name: name, surname: surname, password: password, role: role },)
    })
    if (response.ok) {
        return
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message

        throw new Error("Something went wrong")
    }
}

/** ------------------- Document APIs ------------------------ */
interface AddDocumentParams {
    title: string;
    stakeHolders: Stakeholder[];
    scale: string;
    issuanceDate: string;
    type: string;
    language: string | null;
    pages: string | null;
    description: string;
}


async function addDocument(params: AddDocumentParams) {
    const { title, stakeHolders, scale, issuanceDate, type, language, pages, description } = params;
    let response = await fetch(baseURL + "doc", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ title: title, stakeHolders: stakeHolders, scale: scale, issuanceDate: issuanceDate, type: type, language: language, pages: pages, description: description },)
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message

        throw new Error("Something went wrong")
    }
}


async function getDocumentById(id: number) {
    const response = await fetch(baseURL + "doc/" + id, { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function deleteDocument(id: number) {
    const response = await fetch(baseURL + "doc/" + id, { method: 'DELETE', credentials: "include" })
    if (response.ok) {
        return
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function editDocument(id: number, title: string, stakeHolders: Stakeholder[], scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string) {
    let response = await fetch(baseURL + "doc/" + id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ title: title, stakeHolders: stakeHolders, scale: scale, issuanceDate: issuanceDate, type: type, language: language, pages: pages, description: description },)
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Something went wrong")
    }
}

async function getDocumentLinksById(id: number) {
    const response = await fetch(baseURL + "doc/" + id + "/links", { credentials: "include" })

    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function addResourceToDocument(idDoc: number, name: string, data: string) {
    let response = await fetch(baseURL + "doc/res", {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idDoc: idDoc, name: name, data: data })
    });

    if (response.ok) {
        // Verifica se la risposta ha un corpo
        const responseText = await response.text();  // Usa .text() prima di tentare di fare .json()
        if (responseText) {
            try {
                // Prova a convertire la risposta in JSON
                return JSON.parse(responseText);
            } catch (error) {
                console.error('Failed to parse JSON:', error);
                throw new Error('Server returned an invalid JSON response.');
            }
        } else {
            return {};  // Restituisci un oggetto vuoto o un altro valore di successo
        }
    } else {
        const errDetail = await response.text();
        throw new Error(`Error: ${errDetail}`);
    }
}


async function getResourceData(idDoc: number, idRes: number) {
    const response = await fetch(baseURL + "doc/res/" + idDoc + "/" + idRes, { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function getAllResourcesData(idDoc: number) {
    const response = await fetch(baseURL + "doc/res-all/" + idDoc , { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function deleteResource(idDoc: number, name: string) {
    const response = await fetch(baseURL + "doc/res/" + idDoc + "/" + name, { method: 'DELETE', credentials: "include" })
    if (response.ok) {
        return
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

/** ------------------- Link APIs ------------------------ */
async function addLink(idDoc1: number, idDoc2: number, idLink: number) {
    const response = await fetch(baseURL + "link", { method: 'POST', credentials: "include", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idDoc1: idDoc1, idDoc2: idDoc2, idLink: idLink },) })
    if (response.ok) {
        return 
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Something went wrong")
    }
}

async function deleteLink(idDoc1: number, idDoc2: number, idLink: number) {
    const response = await fetch(baseURL + "link/", { method: 'DELETE', credentials: "include", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idDoc1: idDoc1, idDoc2: idDoc2, idLink: idLink }) })
    if (response.ok) {
        return
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function editLink(idDoc1: number, idDoc2: number, oldLinkId: number, newLinkId: number) {
    const response = await fetch(baseURL + "link/", { method: 'PATCH', credentials: "include", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idDoc1: idDoc1, idDoc2: idDoc2, oldLinkId: oldLinkId, newLinkId: newLinkId }) })
    if (response.ok) {
        return
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Something went wrong")
    }
}

async function getAllLinks() {
    const response = await fetch(baseURL + "link", { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

/** ------------------- Stakeholder APIs ------------------------ */

async function getAllStakeholders() {
    const response = await fetch(baseURL + "stakeholders", { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function addStakeholder(name: string, category: string): Promise<number> {
    const response = await fetch(baseURL + "stakeholders", {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category })
    });

    if (response.ok) {
        const data = await response.json(); // Ottieni la risposta del server
        return data.id; // Restituisci l'ID dello stakeholder
    } else {
        const errDetail = await response.json();
        if (errDetail.error) throw errDetail.error;
        if (errDetail.message) throw errDetail.message;
        throw new Error("Something went wrong");
    }
}

/** ------------------- Coordinates APIs ------------------------ */

async function getAllDocumentsCoordinates() {
    const response = await fetch(baseURL + "coordinates", { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function setDocumentCoordinates(idDoc: number, coordinates: LatLng|LatLng[]) {
    const response = await fetch(baseURL + "coordinates", { 
        method: 'POST', 
        credentials: "include", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            idDoc: idDoc, 
            coordinates: coordinates,
        }) 
    })
    if (response.ok) {
        return 
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Something went wrong")
    }
}

async function updateDocumentCoordinates(idDoc: number, coordinates: LatLng|LatLng[]) {
    const response = await fetch(baseURL + "coordinates" + "/update", { 
        method: 'POST', 
        credentials: "include", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            idDoc: idDoc, 
            coordinates: coordinates
        }) 
    })

    if (response.ok) {
        return 
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Something went wrong")
    }
}

async function deleteDocumentCoordinates(idDoc: number){
    const response = await fetch(`${baseURL}coordinates/${idDoc}`, 
        { 
            method: 'DELETE', 
            credentials: "include", 
        }
    )

    if (response.ok) {
        return 
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Something went wrong")
    }
}

async function getExistingGeoreferences() {
    const response = await fetch(`${baseURL}coordinates/georeferences`, { credentials: "include" })
    if (response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

/** ------------------- Scale APIs ------------------------ */ 
  
async function getScales() {
    const response = await fetch(baseURL + "scale", {credentials: "include"})
    if(response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.message
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function addScale(scale: string) {
    const response = await fetch(baseURL + "scale", {
        method:  'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: scale
        })
    });

    if (response.ok) {
        return 
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error occured when adding a scale");
    }
}


/** ------------------- Type APIs ------------------------ */ 
  
async function getTypes() {
    const response = await fetch(baseURL + "type", {credentials: "include"})
    console.log(response);
    if(response.ok) {
        return await response.json()
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.message
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function addType(type: string) {
    const response = await fetch(baseURL + "type", {
        method:  'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: type
        })
    });

    if (response.ok) {
        return 
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error occured when adding a type");
    }
}


const API = {
    login, logOut, getUserInfo, register,
    addDocument, getDocumentById, deleteDocument, editDocument, getDocumentLinksById, addResourceToDocument, getResourceData, deleteResource, getAllResourcesData,
    getAllStakeholders, addStakeholder,
    addLink, deleteLink, editLink, getAllLinks,
    getAllDocumentsCoordinates, setDocumentCoordinates, updateDocumentCoordinates, deleteDocumentCoordinates, getExistingGeoreferences,
    getScales, addScale, getTypes, addType
}
export default API
