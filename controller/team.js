const { v4: uuidv4 } = require('uuid');
const Database = require("../database/index")
const { Mutex } = require('async-mutex');
class TeamControl {
    constructor() {
        this.database = new Database()
        this.locks = new Map();

    }
    async addTeam(req, res) {
        try {
            const { name, members } = req.body
            if (!name) {
                return res.badRequest("Missing paramters")
            }
            const group_id = uuidv4()
            const { error, details, data, bad } = this.database.insertGroup({
                name,
                members, group_id
            })
            if (bad) {
                return res.badRequest(details)
            }
            if (error) {
                return res.serverError(details)
            }
            return res.created(data)

        }
        catch (error) {
            return res.serverError(error);
        }

    }
    async addExpense(req, res) {
        const { items } = req.body
        const { group_id } = req.query
        if (!items) {
            return res.badRequest("Missing paramters")
        }
        const expense_id = uuidv4()
        if (!this.locks.has(group_id)) {
            this.locks.set(group_id, new Mutex());
        }

        this.locks
            .get(group_id)
            .acquire()
            .then(async (release) => {
                try {
                    const { error, details, data, bad } = this.database.insertExpense({
                        expense_id,
                        group_id, items
                    })
                    if (bad) {
                        return res.badRequest(details)
                    }
                    if (error) {
                        return res.serverError(details)
                    }
                    return res.created(data)
                } catch (error) {
                } finally {
                    release();
                }
            },
            )
    }
    async deleteExpense(req, res) {
        try {
            const { group_id, expense_id } = req.query
            if (!group_id && !expense_id) {
                return res.badRequest("Missing paramters")
            }
            const { error, details } = this.database.deleteExpense({
                expense_id,
                group_id
            })
            if (error) {
                return res.serverError(details)
            }
            return res.success("deleted successfully")

        }
        catch (error) {
            return res.serverError(error);
        }

    }

    async findbalance(req, res) {
        try {
            const { group_id } = req.query
            if (!group_id) {
                return res.badRequest("Missing paramters")
            }
            const { error, details, data } = this.database.findbalance({
                group_id
            })
            if (error) {
                return res.serverError(details)
            }
            return res.success(data)

        }
        catch (error) {
            return res.serverError(error);
        }

    }

}
module.exports = TeamControl