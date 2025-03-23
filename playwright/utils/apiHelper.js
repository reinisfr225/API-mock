// Ensure ES Module syntax is used throughout
const BASE_URL = 'http://localhost:4010';
import Chance from 'chance';

const chance = new Chance();

// Function to generate updated user data
export function getUpdatedUserData() {
    return {
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
}

// API helper functions
export async function createUser(request, userData) {
    return await request.post(`${BASE_URL}/users`, {
        data: userData,
    });
}

export async function getUserById(request, userId) {
    return await request.get(`${BASE_URL}/users/${userId}`);
}

export async function updateUser(request, userId, userData) {
    return await request.put(`${BASE_URL}/users/${userId}`, {
        data: userData,
    });
}

export async function deleteUser(request, userId) {
    return await request.delete(`${BASE_URL}/users/${userId}`);
}
