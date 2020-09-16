const users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //Store the user
    const user = { id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    //Search for username with the correct id
    //You could also use .filter(), however, findIndex will stop running once the user is found but filter will not
    const index = users.findIndex((user) => user.id === id)

    //Check if user was found
    if (index !== -1) {
        //removes the user at the specified index then returns an object from the spliced array
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.findIndex((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}