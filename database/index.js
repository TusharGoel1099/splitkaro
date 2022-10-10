const { group } = require('console');
const fs = require('fs');
var path = require('path');
class Database {
    insertMember({
        name,
        email,
        user_id
    }) {
        try {

            const data = fs.readFileSync(path.join(__dirname, '/data.json'),
                { encoding: 'utf8', flag: 'r' });


            let get_data = JSON.parse(data)
            let users = get_data['users']
            let exist_email = users.find(x => x.email === email)
            if (exist_email) {
                return { error: false, bad: true, details: "member already exist with this email id" }
            }
            users = [...users, { name: name, email: email, user_id: user_id }]
            get_data = { ...get_data, users: users }
            fs.writeFileSync(path.join(__dirname, '/data.json'), JSON.stringify(get_data));
            const result = { name: name, email: email, user_id: user_id }
            return { error: false, details: "user added", data: result }
        }
        catch (exception) {
            const { message } = exception;

            return {
                error: true,
                details: {
                    message,
                },
            };
        }

    }
    insertGroup({
        name,
        members, group_id
    }) {
        try {

            const data = fs.readFileSync(path.join(__dirname, '/data.json'),
                { encoding: 'utf8', flag: 'r' });
            let get_data = JSON.parse(data)
            let groups = get_data['groups']
            let group = groups.find(x => x.group_name === name)
            if (group) {
                return { error: false, bad: true, details: "group already exist with this name" }
            }
            let mem = {}
            members.forEach((x) => {
                mem[x] = 0
            })
            groups = [...groups, { group_id: group_id, members: mem, group_name: name, total_value: 0, expense: [] }]
            get_data = { ...get_data, groups: groups }
            fs.writeFileSync(path.join(__dirname, '/data.json'), JSON.stringify(get_data));

            return { error: false, details: "user added", data: { group_id: group_id, members: mem, group_name: name, total_value: 0, expense: [] } }
        }
        catch (exception) {
            const { message } = exception;

            return {
                error: true,
                details: {
                    message,
                },
            };
        }

    }

    insertExpense({
        expense_id,
        group_id, items
    }) {
        try {

            const data = fs.readFileSync(path.join(__dirname, '/data.json'),
                { encoding: 'utf8', flag: 'r' });

            let get_data = JSON.parse(data)
            let groups = get_data['groups']
            let find_group = groups.find(x => x.group_id === group_id)
            let other_group = groups.filter((x) => x.group_id != group_id)
            if (!find_group) {
                return { error: true, bad: true, details: "no group exsit with this group_id" }
            }
            let count = 0
            items.forEach((x) => {
                count += 1
                find_group.total_value += x.value
                for (const [key, value] of Object.entries(x.paid_by[0])) {
                    console.log(value, find_group.members[key])
                    find_group.members[key] = find_group.members.hasOwnProperty(key) ? find_group.members[key] + value : value
                }
                find_group.expense.push({ expense_id: expense_id + count, expense_name: x.name, value: x.value, shareWith: x.paid_by[0] })
            })
            console.log(other_group, "------------")
            groups = [...other_group, find_group]
            get_data = { ...get_data, groups: groups }
            console.log(get_data)
            fs.writeFileSync(path.join(__dirname, '/data.json'), JSON.stringify(get_data));

            return { error: false, details: "user added", data: find_group.expense }
        }
        catch (exception) {
            const { message } = exception;

            return {
                error: true,
                details: {
                    message,
                },
            };
        }

    }
    deleteExpense({
        expense_id,
        group_id
    }) {
        try {

            const data = fs.readFileSync(path.join(__dirname, '/data.json'),
                { encoding: 'utf8', flag: 'r' });

            let get_data = JSON.parse(data)
            let groups = get_data['groups']
            let find_group = groups.find(x => x.group_id === group_id)
            if (!find_group) {
                return { error: true, details: "no group exsit with this group_id" }
            }
            let expense_index = find_group.expense.findIndex(exp => exp.expense_id === expense_id)
            find_group.total_value -= find_group.expense[expense_index].value
            Object.keys(find_group.expense[expense_index].shareWith).forEach((item) => {
                find_group.members[item] -= find_group.expense[expense_index].shareWith[item]

            })
            find_group.expense.splice(expense_index, 1)
            let other_group = groups.filter((x) => x.group_id != group_id)
            groups = [...other_group, find_group]
            get_data = { ...get_data, groups: groups }
            fs.writeFileSync(path.join(__dirname, '/data.json'), JSON.stringify(get_data));

            return { error: false, details: "user added" }
        }
        catch (exception) {
            const { message } = exception;

            return {
                error: true,
                details: {
                    message,
                },
            };
        }

    }
    findbalance({
        group_id
    }) {
        try {

            const data = fs.readFileSync(path.join(__dirname, '/data.json'),
                { encoding: 'utf8', flag: 'r' });

            let get_data = JSON.parse(data)
            let groups = get_data['groups']
            let find_group = groups.find(x => x.group_id === group_id)
            if (!find_group) {
                return { error: true, details: "no group exsit with this group_id" }
            }
            let payments = find_group.members
            const result = this.splitPayments(payments)
            let balance = {}
            Object.keys(payments).forEach((x) => {

                balance[x] = {
                    "total_balance": 0,
                    "owes_to": [],
                    "owed_by": []
                }
            })
            result.forEach((item) => {
                balance[item[0]]['owes_to'].push({ [item[2]]: item[1] })
                balance[item[0]].total_balance -= item[1]
                balance[item[2]]['owed_by'].push({ [item[0]]: item[1] })
                balance[item[2]].total_balance += item[1]
            })
            return {
                error: false, details: "user added", data: {
                    "name": find_group["group_name"], "balances": balance
                }
            }
        }
        catch (exception) {
            const { message } = exception;

            return {
                error: true,
                details: {
                    message,
                },
            };
        }

    }
    splitPayments(payments) {
        const people = Object.keys(payments);
        const valuesPaid = Object.values(payments);
        let result = []
        const sum = valuesPaid.reduce((acc, curr) => curr + acc);
        const mean = sum / people.length;

        const sortedPeople = people.sort((personA, personB) => payments[personA] - payments[personB]);
        const sortedValuesPaid = sortedPeople.map((person) => payments[person] - mean);

        let i = 0;
        let j = sortedPeople.length - 1;
        let debt;
        while (i < j) {
            debt = Math.min(-(sortedValuesPaid[i]), sortedValuesPaid[j]);
            sortedValuesPaid[i] += debt;
            sortedValuesPaid[j] -= debt;
            let people1 = sortedPeople[i]
            let people2 = sortedPeople[j]

            result = [...result, [people1, Math.round(debt), people2]]

            if (sortedValuesPaid[i] === 0) {
                i++;
            }

            if (sortedValuesPaid[j] === 0) {
                j--;
            }
        }
        return result
    }

}
module.exports = Database