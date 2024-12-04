import {User, Role} from "../../common_models/user";

/**
 * Represents a utility class.
 */
class Utility {
    /**
     * Checks if a user is an urban planner.
     * @param {User} user - The user to check.
     * @returns True if the user is an urban planner, false otherwise.
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
    /**
     * Checks if a user is an urban developer.
     * @param {User} user - The user to check.
     * @returns True if the user is an urban developer, false otherwise.
     */
    static isDeveloper(user: User): boolean {
        return user.role === Role.DEVELOPER
    }

}

export default Utility