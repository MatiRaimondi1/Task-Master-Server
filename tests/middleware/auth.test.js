const authMiddleware = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            header: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        process.env.JWT_SECRET = 'test_secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call next() if the token is valid (via Authorization Bearer)', () => {
        const mockUser = { id: 'user123' };

        req.header.mockReturnValue('Bearer valid_token');
        jwt.verify.mockReturnValue(mockUser);

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret');
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    test('should call next() if the token is valid (via x-auth-token)', () => {
        const mockUser = { id: 'user456' };

        req.header.mockImplementation((headerName) => {
            if (headerName === 'x-auth-token') return 'direct_token';
            return null;
        });

        jwt.verify.mockReturnValue(mockUser);

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('direct_token', 'test_secret');
        expect(next).toHaveBeenCalled();
    });

    test('should return 401 if no token is provided', () => {
        req.header.mockReturnValue(undefined);

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'No token, access denied' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if the token is invalid or has expired', () => {
        req.header.mockReturnValue('Bearer invalid_token');

        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });
});