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
async function addDocument(title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string, pages: string, description: string) {
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

async function getDocumentById(id: string) {
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

async function deleteDocument(id: string) {
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

async function editDocument(id: string, title: string, stakeHolders: string, scale: string, issuanceDate: string, type: string, language: string, pages: string, description: string) {
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

const API = {
    login, logOut, getUserInfo, register,
    addDocument, getAllDocuments, getDocumentById, deleteDocument, editDocument,
}
export default API