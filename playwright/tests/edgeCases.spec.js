import { test, expect } from '@playwright/test';
import { getUserById, updateUser, deleteUser, getUpdatedUserData } from '../utils/apiHelper';

const INVALID_USER_ID = '8c69ad57-e1c1-5e36-b162-xxxxxxxxxxxx';

test.describe('User API - Invalid ID Tests', () => {

    test('Get User by invalid ID', async ({ request }) => {
        const response = await getUserById(request, INVALID_USER_ID);
        expect(response.status()).toBe(404);
    });

    test('Delete User by invalid ID', async ({ request }) => {
        const response = await deleteUser(request, INVALID_USER_ID);
        expect(response.status()).toBe(404);
    });

    test('Update User by invalid ID', async ({ request }) => {
        const updatedUserData = getUpdatedUserData(); // ✅ Get updated user data from helper

        const response = await updateUser(request, INVALID_USER_ID, updatedUserData);

        console.log(await response.text()); // Debugging response

        expect(response.status()).toBe(404);
    });

});
