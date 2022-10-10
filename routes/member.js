const memberControl = require("../controller/member")
class Member {

    constructor(Router) {
        this.Router = Router
        this.member = new memberControl()
    }
    Routes() {
        this.Router.route("/addUser").post((req, res) => this.member.addMember(req, res))
        return this.Router
    }

}
module.exports = Member