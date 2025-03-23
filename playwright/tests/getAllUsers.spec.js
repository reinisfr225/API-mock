import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4010'; // Mock API Server (Prism)
const AUTH_HEADER = 'Basic dXNlcjpwYXNzd29yZA=='; // Authorization header (base64 encoded credentials)

test('Get All Users and Assert Created User', async ({ request }) => {

    const getAllUsersResponse = await request.get(`${BASE_URL}/users`, {
        headers: {
            'Authorization': AUTH_HEADER
        }
    });

    expect(getAllUsersResponse.status()).toBe(200);

    // Parse the response body

});
