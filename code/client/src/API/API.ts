import { User } from "../models/user";

const baseURL = "http://localhost:3001/kiruna/"

/** ------------------- Access APIs ------------------------ */

async function login(username: string, password: string) {
    let response = await fetch(baseURL + "sessions", {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password },)
    })
    console.log(response);
    if (response.ok) {
        const user = await response.json()
        return user
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
        const user = await response.json()
        return user;
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

/** ------------------- User APIs ------------------------ */


async function register(username: string, name: string, surname: string, password: string, role: string) {
    let response = await fetch(baseURL + "users", {
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
async function addDocument(title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string|null) {
    let response = await fetch(baseURL + "doc", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, stakeHolders: stakeHolders, scale: scale, issuanceDate: issuanceDate, type: type, language: language, pages: pages, description: description },)
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

async function getAllDocuments() {
    const response = await fetch(baseURL + "doc", { credentials: "include" })
    if (response.ok) {
        const documents = await response.json()
        return documents
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function getDocumentById(id: number) {
    const response = await fetch(baseURL + "doc/" + id, { credentials: "include" })
    if (response.ok) {
        const document = await response.json()
        return document
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

async function editDocument(id: number, title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string|null) {
    let response = await fetch(baseURL + "doc/" + id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, stakeHolders: stakeHolders, scale: scale, issuanceDate: issuanceDate, type: type, language: language, pages: pages, description: description },)
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

async function getDocumentLinksById(id: number) {
    const response = await fetch(baseURL + "doc/" + id + "/links", { credentials: "include" })
    console.log("pippo")
    console.log(response);
    if (response.ok) {
        const documents = await response.json()
        console.log(documents);
        return documents
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

async function addLink(idDoc1: number, idDoc2: number, name: string) {
    const response = await fetch(baseURL + "link", { method: 'POST', credentials: "include", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idDoc1: idDoc1, idDoc2: idDoc2, name: name },) })
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

async function deleteLink(id: number) {
    const response = await fetch(baseURL + "link/" + id, { method: 'DELETE', credentials: "include" })
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

async function editLink(id: number, name: string) {
    const response = await fetch(baseURL + "link/" + id, { method: 'PATCH', credentials: "include", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name },) })
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

async function getLinkById(id: number) {
    const response = await fetch(baseURL + "link/" + id, { credentials: "include" })
    if (response.ok) {
        const link = await response.json()
        return link
    } else {
        const errDetail = await response.json();
        console.log(errDetail);
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

async function getAllLinks() {
    const response = await fetch(baseURL + "link", { credentials: "include" })
    if (response.ok) {
        const links = await response.json()
        return links
    } else {
        const errDetail = await response.json();
        if (errDetail.error)
            throw errDetail.error
        if (errDetail.message)
            throw errDetail.message
        throw new Error("Error. Please reload the page")
    }
}

const API = {
    login, logOut, getUserInfo, register,
    addDocument, getAllDocuments, getDocumentById, deleteDocument, editDocument, getDocumentLinksById,
    addLink, deleteLink, editLink, getLinkById, getAllLinks
}
export default API