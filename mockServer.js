const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4010; // Port for the mock server
const usersFilePath = path.join(__dirname, 'users.json'); // Path to the users.json file

// Read users data from the file initially if it exists, else initialize an empty array
let users = [];
if (fs.existsSync(usersFilePath)) {
    try {
        users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    } catch (err) {
        console.error('Error reading users data from file:', err);
        users = []; // Initialize with an empty array if parsing fails
    }
}

// Middleware to parse JSON request body
app.use(express.json());

// Function to validate user data based on OpenAPI spec
function validateUser(user) {
    const errors = [];

    // Check for required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'personalIdDocument'];
    requiredFields.forEach(field => {
        if (!user[field]) {
            errors.push(`${field} is required.`);
        }
    });

    // Validate firstName length
    if (user.firstName && (user.firstName.length < 2 || user.firstName.length > 50)) {
        errors.push('firstName must be between 2 and 50 characters.');
    }

    // Validate lastName length
    if (user.lastName && (user.lastName.length < 2 || user.lastName.length > 50)) {
        errors.push('lastName must be between 2 and 50 characters.');
    }

    // Validate email format
    if (user.email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(user.email)) {
        errors.push('Invalid email format.');
    }

    // Validate dateOfBirth format (YYYY-MM-DD)
    if (user.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(user.dateOfBirth)) {
        errors.push('dateOfBirth must be in YYYY-MM-DD format.');
    }

    // Validate personalIdDocument fields
    if (user.personalIdDocument) {
        const doc = user.personalIdDocument;

        // Validate documentId length
        if (doc.documentId && (doc.documentId.length < 5 || doc.documentId.length > 20)) {
            errors.push('documentId must be between 5 and 20 characters.');
        }

        // Validate countryOfIssue format (ISO 3166-1 alpha-2)
        if (doc.countryOfIssue && !/^[A-Z]{2}$/.test(doc.countryOfIssue)) {
            errors.push('countryOfIssue must be a 2-letter country code.');
        }

        // Validate validUntil date format (YYYY-MM-DD)
        if (doc.validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(doc.validUntil)) {
            errors.push('validUntil must be in YYYY-MM-DD format.');
        }
    }

    return errors;
}

// Route to get all users
app.get('/users', (req, res) => {
    console.log('GET /users request received');
    res.json(users);
});

// Route to get a user by ID
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

// Route to create a new user
app.post('/users', (req, res) => {
    const newUser = req.body;

    // Validate the user data
    const validationErrors = validateUser(newUser);
    if (validationErrors.length > 0) {
        return res.status(400).json({
            type: 'https://example.com/problemdetails', // Optional, a URI to the problem type
            title: 'Invalid Input',                    // A short, human-readable summary of the problem
            status: 400,                               // HTTP Status Code
            detail: validationErrors.join(', '),      // Detailed description of the problem
            instance: '/users'                         // URI reference to the specific instance of the problem (optional)
        });
    }

    // Ensure the new user has an id (Basic validation)
    if (!newUser.id) {
        return res.status(400).json({
            type: 'https://example.com/problemdetails',
            title: 'Invalid Input',
            status: 400,
            detail: 'User must have an id',
            instance: '/users'
        });
    }

    // Add the new user to the users array
    users.push(newUser);

    // Save the updated users data to the users.json file
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error writing to users.json file:', err);
        return res.status(500).send('Internal Server Error');
    }
    
    res.status(201).json(newUser); // Respond with the created user
});

// Route to update a user by ID
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;

    // Validate the updated user data
    const validationErrors = validateUser(updatedUser);
    if (validationErrors.length > 0) {
        return res.status(400).json({
            errors: validationErrors
        });
    }

    // Find the user by ID and update their information
    let user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).send('User not found');
    }

    // Update the user (overwriting old data)
    Object.assign(user, updatedUser);

    // Save the updated users data
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error writing to users.json file:', err);
        return res.status(500).send('Internal Server Error');
    }

    res.status(200).json(user); // Respond with the updated user
});

// Route to delete a user by ID
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).send('User not found');
    }

    // Remove the user from the array
    users.splice(userIndex, 1);

    // Save the updated users data
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error writing to users.json file:', err);
        return res.status(500).send('Internal Server Error');
    }

    res.status(204).send(); // Respond with no content to indicate successful deletion
});

// Start the Express server
app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
});
