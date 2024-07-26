const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB (replace with your own URI)
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    password: String // Adding password field for additional issues
});

const User = mongoose.model('User', UserSchema);

// Hardcoded secret key (security vulnerability)
const secretKey = "hardcodedsecretkey";

// Create a new user
app.post('/user', (req, res) => {
    // No input validation
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: crypto.createHmac('sha256', secretKey).update(req.body.password).digest('hex') // Insecure hashing
    });

    user.save((err) => {
        if (err) {
            res.status(500).send('Error creating user');
        } else {
            res.send('User created');
        }
    });
});

// Get all users with callback hell and inefficient sorting
app.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.status(500).send('Error fetching users');
        } else {
            users.sort((a, b) => a.age - b.age); // Inefficient in-memory sorting
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

// Route that causes memory leak
app.get('/leak', (req, res) => {
    const largeArray = [];
    for (let i = 0; i < 1e6; i++) {
        largeArray.push({ index: i });
    }
    res.send('Memory leak route');
});

// Improper error logging
app.get('/error', (req, res) => {
    try {
        // Simulating error
        throw new Error('Test error');
    } catch (err) {
        console.error('Error occurred:', err); // Logging full error
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
