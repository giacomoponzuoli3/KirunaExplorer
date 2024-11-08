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
async function addDocument(title: string, stakeHolders: number[], scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string) {
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

async function getAllDocuments() {
    const response = await fetch(baseURL + "doc", { credentials: "include" })
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

async function editDocument(id: number, title: string, stakeHolders: number[], scale: string, issuanceDate: string, type: string, language: string|null, pages: string|null, description: string) {
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

async function getDocumentDescriptionById(id: number) {
    const response = await fetch(baseURL + "doc/" + id + "/description", { credentials: "include" })
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

async function getDocumentTitleById(id: number) {
    const response = await fetch(baseURL + "doc/" + id + "/title", { credentials: "include" })
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

async function getDocumentIssuanceDateById(id: number) {
    const response = await fetch(baseURL + "doc/" + id + "/issuanceDate", { credentials: "include" })
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

async function getAllDocumentsOfSameType(type: string) {
    let response = await fetch(baseURL + "doc", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ type: type},)
    })
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

const API = {
    login, logOut, getUserInfo, register,
    addDocument, getAllDocuments, getDocumentById, deleteDocument, editDocument, getDocumentLinksById, getDocumentDescriptionById, getDocumentTitleById, getDocumentIssuanceDateById, getAllDocumentsOfSameType,
    addLink, deleteLink, editLink, getAllLinks, getAllStakeholders
}
export default API