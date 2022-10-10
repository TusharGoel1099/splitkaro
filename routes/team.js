const TeamControl = require("../controller/team")
class Team {

    constructor(Router) {
        this.Router = Router
        this.team = new TeamControl()
    }
    Routes() {
        this.Router.route("/addGroup").post((req, res) => this.team.addTeam(req, res))
        this.Router.route("/addExpense").post((req, res) => this.team.addExpense(req, res))
        this.Router.route("/deleteExpense").put((req, res) => this.team.deleteExpense(req, res))
        this.Router.route("/findbalance").get((req, res) => this.team.findbalance(req, res))
        return this.Router
    }

}
module.exports = Team