import { User, Role } from "./components/user"
/**
 * Represents a utility class.
 */
class Utility {
    /**
     * Checks if a user is a urban planner.
     * @param {User} user - The user to check.
     * @returns True if the user is a urban planner, false otherwise.
     */
    static isPlanner(user: User): boolean {
        return user.role === Role.PLANNER
    }
    /**
     * Checks if a user is a resident.
     * @param {User} user - The user to check.
     * @returns True if the user is a resident, false otherwise.
     */
    static isResident(user: User): boolean {
        return user.role === Role.RESIDENT
    }

}

export default Utility