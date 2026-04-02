const request = require('supertest');
const express = require('express');
const authController = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const { sendVerificationEmail } = require('../../src/utils/mailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User');
jest.mock('../../src/utils/mailer');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

app.post('/register', authController.register);
app.post('/verify', authController.verify);
app.post('/login', authController.login);
app.post('/resend', authController.resendCode);

describe('Auth Controller Unit Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        test('should register a user successfully', async () => {
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.prototype.save = jest.fn().mockResolvedValue(true);
            sendVerificationEmail.mockResolvedValue(true);

            const res = await request(app)
                .post('/register')
                .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe("Verification code sent to email");
            expect(sendVerificationEmail).toHaveBeenCalled();
        });

        test('should fail if the user already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'test@test.com' });

            const res = await request(app)
                .post('/register')
                .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toBe("User already exists");
        });
    });

    describe('POST /verify', () => {
        test('should verify the user with the correct code', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@test.com',
                verificationCode: '123456',
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('fakeToken');

            const res = await request(app)
                .post('/verify')
                .send({ email: 'test@test.com', code: '123456' });

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBe('fakeToken');
            expect(mockUser.isVerified).toBe(true);
        });

        test('should fail if the code is incorrect', async () => {
            const mockUser = { verificationCode: '123456' };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/verify')
                .send({ email: 'test@test.com', code: '000000' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Incorrect verification code");
        });
    });

    describe('POST /login', () => {
        test('should login successfully', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@test.com',
                password: 'hashedPassword',
                isVerified: true
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fakeToken');

            const res = await request(app)
                .post('/login')
                .send({ email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        test('should block login if not verified', async () => {
            const mockUser = { email: 'test@test.com', isVerified: false };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/login')
                .send({ email: 'test@test.com', password: 'password123' });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("PENDING_VERIFICATION");
        });
    });

    describe('POST /resend', () => {
        test('should resend verification code if the user exists and is not verified', async () => {
            const mockUser = {
                email: 'test@test.com',
                isVerified: false,
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/resend')
                .send({ email: 'test@test.com' });

            expect(res.statusCode).toBe(200);
            expect(sendVerificationEmail).toHaveBeenCalled();
        });
    });
});