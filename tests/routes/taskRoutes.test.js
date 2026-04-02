const request = require('supertest');
const express = require('express');
const taskRoutes = require('../../src/routes/taskRoutes');
const taskController = require('../../src/controllers/taskController');
const auth = require('../../src/middleware/auth');

jest.mock('../../src/controllers/taskController');
jest.mock('../../src/middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        auth.mockImplementation((req, res, next) => {
            req.user = { id: 'user123' };
            next();
        });
    });

    test('GET /api/tasks should be protected by auth and call getTasks', async () => {
        taskController.getTasks.mockImplementation((req, res) => res.sendStatus(200));

        const res = await request(app).get('/api/tasks');

        expect(auth).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(taskController.getTasks).toHaveBeenCalled();
    });

    test('POST /api/tasks should call createTask', async () => {
        taskController.createTask.mockImplementation((req, res) => res.sendStatus(201));

        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'New Task' });

        expect(auth).toHaveBeenCalled();
        expect(res.statusCode).toBe(201);
        expect(taskController.createTask).toHaveBeenCalled();
    });

    test('PUT /api/tasks/:id should call updateTask', async () => {
        taskController.updateTask.mockImplementation((req, res) => res.sendStatus(200));

        const res = await request(app)
            .put('/api/tasks/123')
            .send({ title: 'Updated Task' });

        expect(auth).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(taskController.updateTask).toHaveBeenCalled();
    });

    test('DELETE /api/tasks/:id should call deleteTask', async () => {
        taskController.deleteTask.mockImplementation((req, res) => res.sendStatus(200));

        const res = await request(app).delete('/api/tasks/123');

        expect(auth).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(taskController.deleteTask).toHaveBeenCalled();
    });

    test('Should fail if the auth middleware blocks the request', async () => {
        auth.mockImplementation((req, res, next) => {
            return res.status(401).json({ msg: 'No token, access denied' });
        });

        const res = await request(app).get('/api/tasks');

        expect(res.statusCode).toBe(401);
        expect(taskController.getTasks).not.toHaveBeenCalled();
    });
});