/**
 * Represents a user in the system.
 */
class User {
    username: string
    name: string
    surname: string
    role: string

    /**
     * Creates a new instance of the User class.
     * @param username - The username of the user. This is unique for each user.
     * @param name - The name of the user.
     * @param surname - The surname of the user.
     * @param role - The role of the user. This can be ""
     * @param address - The address of the user. Is null when the user is created, can be updated later.
     * @param birthdate - The birthdate of the user. Is null when the user is created, can be updated later.
     */
    constructor(username: string, name: string, surname: string, role: string) {
        this.username = username
        this.name = name
        this.surname = surname
        this.role = role;
    }
}

/**
 * Represents the role of a user.
 * The values present in this enum are the only valid values for the role of a user.
 */
enum Role {
    PLANNER = "Urban Planner",
    RESIDENT = "Resident",
    DEVELOPER = "Urban Developer"
}


export { User, Role}