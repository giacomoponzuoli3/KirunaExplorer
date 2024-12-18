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
}

export default Utility