const { MailtrapClient } = require("mailtrap");

const mockSendFn = jest.fn();

jest.mock("mailtrap", () => {
    return {
        MailtrapClient: jest.fn().mockImplementation(() => ({
            send: mockSendFn
        }))
    };
});

const { sendVerificationEmail } = require('../../src/utils/mailer');

describe('Mailer Unit Tests', () => {
 
    beforeEach(() => {
        jest.clearAllMocks();
        mockSendFn.mockResolvedValue({ success: true });
    });

    test('should call MailtrapClient.send with the correct parameters', async () => {
        const testEmail = 'user@example.com';
        const testCode = '123456';

        await sendVerificationEmail(testEmail, testCode);

        expect(mockSendFn).toHaveBeenCalledTimes(1);

        const callArgs = mockSendFn.mock.calls[0][0];
        expect(callArgs.to).toEqual([{ email: testEmail }]);
        expect(callArgs.subject).toContain("Verify your account");
        expect(callArgs.html).toContain(testCode);
    });

    test('should handle errors if the email sending fails', async () => {
        mockSendFn.mockRejectedValue(new Error('Mailtrap Error'));

        await expect(sendVerificationEmail('test@test.com', '000'))
            .rejects
            .toThrow('Mailtrap Error');
    });
});