const mongoose = require('mongoose');
const User = require('./models/user');

async function createUser() {
    await mongoose.connect('mongodb://localhost:27017/sBus');

    const user = new User({
        username: 'ali123',
        name: 'علي محمد احمد',
        type: 'owner'
    });

    await User.register(user, '123'); // Hashes password using passport-local-mongoose
    console.log('User created');
    mongoose.connection.close();
}

createUser();
