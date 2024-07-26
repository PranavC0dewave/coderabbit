const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB (replace with your own URI)
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number
});

const User = mongoose.model('User', UserSchema);

// Create a new user
app.post('/user', (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    });

    user.save().then(() => {
        res.send('User created');
    });
});

// Get all users
app.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.status(500).send('Error fetching users');
        } else {
            res.send(users);
        }
    });
});

// Update user by email (Potential NoSQL injection vulnerability)
app.put('/user/:email', (req, res) => {
    User.updateOne({ email: req.params.email }, { $set: req.body }, (err, result) => {
        if (err) {
            res.status(500).send('Error updating user');
        } else {
            res.send('User updated');
        }
    });
});

// Delete user by email
app.delete('/user/:email', (req, res) => {
    User.deleteOne({ email: req.params.email }, (err) => {
        if (err) {
            res.status(500).send('Error deleting user');
        } else {
            res.send('User deleted');
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
