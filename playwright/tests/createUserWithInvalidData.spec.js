import { test, expect } from '@playwright/test';
import Chance from 'chance';
import { createUser } from '../utils/apiHelper';

const chance = new Chance();

test('Create User without required fields', async ({ request }) => {
    const newUser = {
        id: chance.guid(),
        email: chance.email(),
    };

    const response = await createUser(request, newUser);

    expect(response.status()).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('type', 'https://example.com/problemdetails');
    expect(responseBody).toHaveProperty('title', 'Invalid Input');
    expect(responseBody).toHaveProperty('status', 400);
    expect(responseBody).toHaveProperty('detail');
    expect(responseBody.detail).toContain('firstName is required.');
    expect(responseBody.detail).toContain('lastName is required.');
    expect(responseBody.detail).toContain('dateOfBirth is required.');
    expect(responseBody.detail).toContain('personalIdDocument is required.');
    expect(responseBody).toHaveProperty('instance', '/users');

});

test('Create User where name doesnt meet min range required fields', async ({ request }) => {
    const newUser = {
        id: chance.guid(),
        firstName: "w",
        lastName: "a",
        email: chance.email(),
        dateOfBirth: '1990-05-15',
        personalIdDocument: {
            documentId: 'asd',
            countryOfIssue: 'UK',
            validUntil: '2032-08-20'
        }
    };

    const response = await createUser(request, newUser);

    expect(response.status()).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('type', 'https://example.com/problemdetails');
    expect(responseBody).toHaveProperty('title', 'Invalid Input');
    expect(responseBody).toHaveProperty('status', 400);
    expect(responseBody).toHaveProperty('detail');
    expect(responseBody.detail).toContain('firstName must be between 2 and 50 characters.');
    expect(responseBody.detail).toContain('lastName must be between 2 and 50 characters.');
    expect(responseBody.detail).toContain('documentId must be between 5 and 20 characters.');
    expect(responseBody).toHaveProperty('instance', '/users');

});

test('Create User where name doesnt meet max range required fields', async ({ request }) => {
    const newUser = {
        id: chance.guid(),
        firstName: chance.string({ length: 51 }),
        lastName: chance.string({ length: 51 }),
        email: chance.email(),
        dateOfBirth: '1990-05-15',
        personalIdDocument: {
            documentId: chance.string({ length: 21 }),
            countryOfIssue: 'UK',
            validUntil: '2032-08-20'
        }
    };

    const response = await createUser(request, newUser);

    expect(response.status()).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('type', 'https://example.com/problemdetails');
    expect(responseBody).toHaveProperty('title', 'Invalid Input');
    expect(responseBody).toHaveProperty('status', 400);
    expect(responseBody).toHaveProperty('detail');
    expect(responseBody.detail).toContain('firstName must be between 2 and 50 characters.');
    expect(responseBody.detail).toContain('lastName must be between 2 and 50 characters.');
    expect(responseBody.detail).toContain('documentId must be between 5 and 20 characters.');
    expect(responseBody).toHaveProperty('instance', '/users');

});