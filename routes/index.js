const Member = require("./member");
const Team = require("./team");
class Routing {
    constructor(Router) {
        this.Router = Router
    }
    Routed() {
        new Member(this.Router).Routes()
        new Team(this.Router).Routes()
        return this.Router;
    }

}
module.exports =
    Routing
