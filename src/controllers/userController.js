const {promises: fsAsync} = require("fs");
const fs = require("fs");
const {userData: userData} = require("../utils/paths");

class UserController {
    static async readUser(id) {
        let data;
        try {
            data = await fsAsync.readFile(userData, 'utf-8');
            data = JSON.parse(data);
        } catch (e) {
            console.log(e);
            return undefined;
        }

        data = data?.filter(user => user.id === id);
        return data?.[0];
    }

    static async updateUser(newUser) {
        if (!fs.existsSync(userData)) {
            return newUser;
        }
        let users = await fsAsync.readFile(userData, 'utf-8');
        if (!users) {
            return newUser;
        }
        users = JSON.parse(users);
        users = users?.map(user => {
            return user.id === newUser.id ? newUser : user
        });
        let ignore = await fsAsync.writeFile(userData, JSON.stringify(users), 'utf-8');
        return newUser;
    }
}

module.exports = UserController;