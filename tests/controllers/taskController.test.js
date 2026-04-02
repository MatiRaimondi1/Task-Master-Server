const request = require('supertest');
const express = require('express');
const taskController = require('../../src/controllers/taskController');
const Task = require('../../src/models/Task');

jest.mock('../../src/models/Task');

const app = express();
app.use(express.json());

const mockAuth = (req, res, next) => {
    req.user = { id: 'user123' };
    next();
};

app.get('/tasks', mockAuth, taskController.getTasks);
app.post('/tasks', mockAuth, taskController.createTask);
app.put('/tasks/:id', mockAuth, taskController.updateTask);
app.delete('/tasks/:id', mockAuth, taskController.deleteTask);

describe('Task Controller Unit Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /tasks', () => {
        test('should return all tasks for the logged-in user', async () => {
            const mockTasks = [
                { title: 'Task 1', user: 'user123' },
                { title: 'Task 2', user: 'user123' }
            ];

            Task.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTasks)
            });

            const res = await request(app).get('/tasks');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(Task.find).toHaveBeenCalledWith({ user: 'user123' });
        });

        test('should return 500 if there is a database error', async () => {
            Task.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('DB Error'))
            });

            const res = await request(app).get('/tasks');
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Error fetching tasks");
        });
    });

    describe('POST /tasks', () => {
        test('should create a new task successfully', async () => {
            const taskData = { title: 'New Task' };
            const savedTask = { ...taskData, _id: 'task999', user: 'user123' };

            Task.prototype.save = jest.fn().mockResolvedValue(savedTask);

            const res = await request(app)
                .post('/tasks')
                .send(taskData);

            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe('New Task');
            expect(res.body.user).toBe('user123');
        });

        test('should return 400 if required data is missing', async () => {
            Task.prototype.save = jest.fn().mockRejectedValue(new Error('Validation error'));

            const res = await request(app).post('/tasks').send({});
            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /tasks/:id', () => {
        test('should update a task if the user is the owner', async () => {
            const updatedTask = { title: 'Updated Task', user: 'user123' };
            Task.findOneAndUpdate.mockResolvedValue(updatedTask);

            const res = await request(app)
                .put('/tasks/task999')
                .send({ title: 'Updated Task' });

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Updated Task');
            expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'task999', user: 'user123' },
                { title: 'Updated Task' },
                { new: true }
            );
        });

        test('should return 404 if the task does not exist or does not belong to the user', async () => {
            Task.findOneAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .put('/tasks/fake_id')
                .send({ title: 'Something' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Task not found or unauthorized");
        });
    });

    describe('DELETE /tasks/:id', () => {
        test('should delete a task successfully', async () => {
            Task.findOneAndDelete.mockResolvedValue({ _id: 'task999' });

            const res = await request(app).delete('/tasks/task999');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Task deleted successfully");
            expect(Task.findOneAndDelete).toHaveBeenCalledWith({
                _id: 'task999',
                user: 'user123'
            });
        });

        test('should return 404 if the task does not exist or does not belong to the user', async () => {
            Task.findOneAndDelete.mockResolvedValue(null);

            const res = await request(app).delete('/tasks/fake_id');
            expect(res.statusCode).toBe(404);
        });
    });
});