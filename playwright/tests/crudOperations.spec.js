import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { test, expect, beforeEach } from '@playwright/test'; // Correct import for lifecycle hooks
import Chance from 'chance';
import { createUser, getUserById, updateUser, deleteUser } from '../utils/apiHelper';

const chance = new Chance();
const idFilePath = resolve(__dirname, '../generatedUserId.txt');
const filePath = resolve(__dirname, '../users.json');

let generatedUserId;

// Helper function to get the latest user ID from the generatedUserId.txt file
function getLatestUserIdFromFile() {
    if (existsSync(idFilePath)) {
        return readFileSync(idFilePath, 'utf8').trim();
    }
    return null;
}

// Cleanup the users.json before each test (Optional, if you want a clean slate)
beforeEach(() => {
    if (existsSync(filePath)) {
        unlinkSync(filePath); // Remove the users.json file before each test if required
    }
});

// Test to create a new user and save it to the users.json file
test('Create User and Save to JSON File', async ({ request }) => {
    const newUser = {
        id: chance.guid(),
        firstName: chance.first(),
        lastName: chance.last(),
        email: chance.email(),
        dateOfBirth: '1990-05-15',
        personalIdDocument: {
            documentId: 'CD789123',
            countryOfIssue: 'UK',
            validUntil: '2032-08-20'
        }
    };

    generatedUserId = newUser.id;

    // Create a new user via API
    const response = await createUser(request, newUser);
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(newUser.id);

    // Prepare current users array to add new user
    let currentUsers = [];

    // Check if users.json file exists and read its content
    if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, 'utf8');
        if (fileContent.trim()) {
            currentUsers = JSON.parse(fileContent);
        }
    }

    // Ensure no duplicate user is added
    const existingUserIds = currentUsers.map(user => user.id);
    if (!existingUserIds.includes(newUser.id)) {
        currentUsers.push(newUser);
    }

    // Write the updated list of users to users.json
    writeFileSync(filePath, JSON.stringify(currentUsers, null, 2));

    // Save the generated user ID to a separate file for use in other tests
    writeFileSync(idFilePath, newUser.id);
});

// Test to fetch a user by ID from the generatedUserId.txt file
test('Get User by ID', async ({ request }) => {
    const latestUserId = getLatestUserIdFromFile();

    if (!latestUserId) {
        throw new Error("No user ID found in generatedUserId.txt");
    }

    console.log(`Fetching user with ID from file: ${latestUserId}`);

    const response = await getUserById(request, latestUserId);

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log("Fetched User:", body);

    expect(body.id).toBe(latestUserId);
    expect(body.email).toBeTruthy();
});

// Test to update a user and validate the updated data
test('Update User and Assert Afterwards the Update', async ({ request }) => {
    generatedUserId = getLatestUserIdFromFile();

    if (!generatedUserId) {
        throw new Error('Generated user ID file not found');
    }

    const updatedUserData = {
        firstName: "updatedName1111",
        lastName: "updatedName2222",
        email: chance.email(),
        dateOfBirth: '1990-05-15',
        personalIdDocument: {
            documentId: 'CD789123',
            countryOfIssue: 'UK',
            validUntil: '2032-08-20'
        }
    };

    // Update the user via API
    const response = await updateUser(request, generatedUserId, updatedUserData);

    expect(response.status()).toBe(200);

    // Fetch updated user to validate the changes
    const updatedUser = await getUserById(request, generatedUserId);
    expect(updatedUser.status()).toBe(200);

    const updatedUserBody = await updatedUser.json();
    expect(updatedUserBody.id).toBe(generatedUserId);
    expect(updatedUserBody.firstName).toBe(updatedUserData.firstName);
    expect(updatedUserBody.lastName).toBe(updatedUserData.lastName);
    expect(updatedUserBody.email).toBe(updatedUserData.email);
});

// Test to delete a user and verify that it is deleted
test('Delete User and Validate Deletion', async ({ request }) => {
    const latestUserId = getLatestUserIdFromFile();

    if (!latestUserId) {
        throw new Error("No user ID found in generatedUserId.txt");
    }

    console.log(`Deleting user with ID from file: ${latestUserId}`);

    // Delete the user via API
    const deleteResponse = await deleteUser(request, latestUserId);

    expect(deleteResponse.status()).toEqual(204);

    // Verify the user is deleted by attempting to fetch it
    const fetchResponse = await getUserById(request, latestUserId);

    expect(fetchResponse.status()).toBe(404);
});
