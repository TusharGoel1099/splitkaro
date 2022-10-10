const { v4: uuidv4 } = require('uuid');
const Database = require("../database/index")
class MemberControl {
    constructor() {
        this.database = new Database()
    }
    async addMember(req, res) {
        try {
            const { name,
                email } = req.body
            if (!name || !email) {
                return res.badRequest()
            }
            const user_id = uuidv4()
            const { error, bad, details, data } = this.database.insertMember({
                name,
                email,
                user_id
            })
            if (error) {
                return res.serverError()
            }
            if (bad) {
                return res.badRequest(details)
            }
            console.log(data)
            return res.created(data)

        }
        catch (error) {
            return res.serverError(error);
        }

    }
}
module.exports = MemberControl