const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');
const authController = require('../../src/controllers/authController');

jest.mock('../../src/controllers/authController');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/auth/register should call authController.register', async () => {
        authController.register.mockImplementation((req, res) => res.status(201).json({ ok: true }));

        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test', email: 'test@test.com', password: '123' });

        expect(res.statusCode).toBe(201);
        expect(authController.register).toHaveBeenCalled();
    });

    test('POST /api/auth/verify should call authController.verify', async () => {
        authController.verify.mockImplementation((req, res) => res.status(200).json({ ok: true }));

        const res = await request(app)
            .post('/api/auth/verify')
            .send({ email: 'test@test.com', code: '123456' });

        expect(res.statusCode).toBe(200);
        expect(authController.verify).toHaveBeenCalled();
    });

    test('POST /api/auth/login should call authController.login', async () => {
        authController.login.mockImplementation((req, res) => res.status(200).json({ ok: true }));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: '123' });

        expect(res.statusCode).toBe(200);
        expect(authController.login).toHaveBeenCalled();
    });

    test('POST /api/auth/resend-code should call authController.resendCode', async () => {
        authController.resendCode.mockImplementation((req, res) => res.status(200).json({ ok: true }));

        const res = await request(app)
            .post('/api/auth/resend-code')
            .send({ email: 'test@test.com' });

        expect(res.statusCode).toBe(200);
        expect(authController.resendCode).toHaveBeenCalled();
    });
});