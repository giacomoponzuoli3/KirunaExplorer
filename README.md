# Kiruna Explorer

## Client Routes

- Route `/`: the application homepage. Contains the navbar and a list with all the documents in the database.
- Route `documents/:idDocument/links`: page that shows all the links for a given document.
Contains the navbar and a list with all the link information.
- Route `/login`: log in page for the urban planners. Contains the navbar and a login form.
- Route `*`: fallback page shown whether the client tries to navigate to a not implemented route.
Contains the navbar and an error message

## Server API

- POST `/sessions`: performs the login of an urban planner:
  - has no parameters
  - body contains the user's username and password
  - returns a 200 code and the user's information if it's successful, a 401 code in case of errors
- DELETE `/sessions/current`: performs the logout of the current user:
  - has no parameters nor body
  - returns a 200 code in case of success, a 503 code in case of errors
- GET `/sessions/current`: retrieves the information of the currently logged-in user:
  - has no parameters nor body
  - returns a 200 code and the user's information in case of success, a 503 code in case of errors


- POST `/doc`: adds a new document to the database:
  - has no parameters
  - body contains the new document's information (title, stakeholders, scale, issue date, type, language, pages, description)
  - returns a 200 code if the document is successfully added to the database, a 503 code in case of errors
- GET `/doc`: retrieves all the documents in the database:
  - has no parameters nor body
  - returns a 200 code and a list with all the documents' information when successful, a 503 code in case of errors
- GET `/doc/:id`: retrieves a given document's info:
  - has, as the only parameter, the ID of the document to search for
  - has no body
  - returns a 200 code and the requested document's info when successful, a 503 code in case of errors
- DELETE `/doc/:id`: removes a given document from the database:
  - has, as the only parameter, the ID of the document to delete
  - has no body
  - returns a 200 code in case of success, a 503 code in case of errors
- PATCH `/doc/:id`: modifies the information about a given document:
  - has, as the only parameter, the ID of the document to edit
  - body contains the new information (title, stakeholders, scale, issue date, type, language, pages, description)
  - returns a 200 code in case of success, a 503 code in case of errors
- GET `/doc/:id/links`: retrieves all the links for a given document
  - has, as the only parameter, the ID of the document to search the links for
  - has no body
  - returns a 200 code and a list with all the relative links' information when successful, a 503 code in case of errors


- POST `/link`: adds a new link between two documents:
  - has no parameters
  - body contains the IDs of the documents to link, and the ID of the link itself
  - returns a 200 code in case of success, a 503 code in case of errors
- GET `/link`: retrieves a list of all the links in the database:
  - has no parameters nor body
  - returns a 200 code and a list with the retrieved links' info when successful, a 503 code in case of errors


- GET `/stakeholders`: retrieves a list of all the stakeholders in the database:
  - has no parameters nor body
  - returns a 200 code and a list with the retrieved stakeholders' info when successful, a 503 code in case of errors

## Database Tables

- Table `users`: contains a row for each user (urban planner), with the attributes:
  - username TEXT NOT NULL UNIQUE (primary key)
  - name TEXT NOT NULL
  - surname TEXT NOT NULL
  - role TEXT NOT NULL
  - password TEXT
  - salt TEXT
- Table `documents`: contains a row for each document, with attributes:
  - id INTEGER NOT NULL UNIQUE (primary key with autoincrement)
  - title TEXT NOT NULL
  - scale TEXT NOT NULL
  - issuance_date TEXT NOT NULL
  - type TEXT NOT NULL
  - language TEXT
  - pages TEXT
  - description TEXT
- Table `links`: contains a row for each link type (Direct consequence, Collateral consequence, Prevision, Update), with attributes:
  - id INTEGER NOT NULL UNIQUE (primary key with autoincrement)
  - name TEXT NOT NULL
- Table `documents_links`: contains a row for each link, with attributes:
  - id_document1 INTEGER NOT NULL (foreign key `documents.id`)
  - id_document2 INTEGER NOT NULL (foreign key `documents.id`)
  - id_link TEXT NOT NULL
  - the combination of all 3 attributes acts as primary key
- Table `stakeholders`: contains a row for each stakeholder, with attributes:
  - id INTEGER NOT NULL UNIQUE (primary key with autoincrement)
  - name TEXT NOT NULL
  - category TEXT NOT NULL
- Table `stakeholders_documents`: contains a row for each combination of (stakeholder, document): with attributes
  - id_stakeholder INTEGER NOT NULL (foreign key `stakeholders.id` ON DELETE CASCADE)
  - id_document INTEGER NOT NULL (foreign key `documents.id` ON DELETE CASCADE)
  - the combination of both attributes serves as primary key

## Main React Components

- `NotFoundLayout` (in `NotFoundLayout.tsx`): shows an error message (404 "page not found") and a button to return to the home page.
- `Login` (in `Login.tsx`): shows a simple form, asking for username and password, to log in.
- `LoginButton` (in `Login.tsx`): a button used to navigate to the login page. It's shown in the navbar of the homepage
when the user is not logged in.
- `LogoutButton` (in `Login.tsx`): a button used to log out a user. It's shown in the navbar of the homepage when the
user is logged in.
- `Homepage` (in `Homepage.tsx`): shows a grid of cards showing, for each document in the database, the title and an icon
indicating the type. Also, clicking on the card opens a modal showing the document's information.
- `ButtonHomePage` (in `Homepage.tsx`): a button used to return to the home page. It's shown in the navbar of the login
page, to return to the homepage without logging in.
- `AddDocumentModal` (in `DocumentModals.tsx`): shows a form to fill in the information for a document to add.
Filling and submitting the form will call the API to add a new document to the database, with the filled-in info.
- `ShowDocumentInfoModal` (in `DocumentModals.tsx`): shows a document's information. If the user is logged in as an
urban planner, also shows two buttons to, respectively, edit and delete the document.
- `EditDocumentModal` (in `DocumentModals.tsx`): shows a form, pre-filled with the relative document's information.
Editing the information and then submitting the form will call the API to edit the document.
- `LinksDocument` (in `LinksDocument.tsx`): shows a table, containing the title, stakeholders and an icon indicating the
document type of every document connected to a given one, together with the connection type. If the user is logged in as
an urban planner, additionally shows, for each connection, a button to delete it. At the end of the page, if the user
is logged in as an urban planner, shows a button which, when clicked, opens a modal to add a new connection.
- `AddLinkModal` (in `AddLinkModal.tsx`): shows a form to select a document, with which to add a new connection, and the
connection type. When the form is filled in and submitted, an API call to add the connection is performed.
- `Alert` (in `Alert.tsx`): shows an alert that notifies the user that a given connection already exists. It's used in
AddLinkModal component, and shown when an urban planner tries to add an already existing connection.
- `ConfirmModal` (in `ConfirmModal.tsx`): shows a simple confirmation modal to delete a connection. It's used in the LinksDocument
component, and shown when an urban planner clicks on the button to delete a connection.

## Screenshots

Homepage:
![Homepage](./screenshots/Homepage.png "Homepage")

Document info:
![Document info](./screenshots/DocumentModal.png "Document info")

Connections:
![Connections](./screenshots/Connections.png "Connections")

Login page:
![Login page](./screenshots/Login.png "Login page")

New document modal:
![New document](./screenshots/NewDocumentModal.png "New document")

Edit document modal:
![Edit document](./screenshots/EditDocumentModal.png "Edit document")

New connection modal:
![New connection](./screenshots/NewConnectionModal.png "New connection")

## Users credentials

- Generic urban planner:
  - username: urban_planner
  - password: admin

## Docker Instruction for Kiruna Explorer
All the next bash command must be executed from code directory.
### How to build the Docker image

```bash
docker compose build
```

### How to run the Docker image

```bash
docker compose up
```

### Access the application

The application can be accessed at http://localhost:3000/kiruna