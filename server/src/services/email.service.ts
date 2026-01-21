// @ts-ignore
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sender = { email: process.env.EMAIL_FROM || 'no-reply@example.com', name: 'Expense Tracker' };

export const sendDepositEmail = async (userEmail: string, userName: string, amount: number) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: userEmail, name: userName }];
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.subject = 'Deposit Received';
        sendSmtpEmail.htmlContent = `
            <h1>Deposit Received</h1>
            <p>Hello ${userName},</p>
            <p>We are pleased to inform you that a deposit of <strong>LKR ${amount}</strong> has been made to your wallet.</p>
            <p>Thank you.</p>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Deposit email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending deposit email:', error);
    }
};

export const sendLowBalanceEmail = async (hrEmails: string[], userName: string, balance: number, depositAmount: number) => {
    try {
        if (!hrEmails || hrEmails.length === 0) return;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = hrEmails.map(email => ({ email }));
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.subject = `Low Balance Alert: ${userName}`;
        sendSmtpEmail.htmlContent = `
            <h1>Low Balance Alert</h1>
            <p>User <strong>${userName}</strong> has exceeded their deposit amount.</p>
            <p><strong>Current Balance:</strong> LKR ${balance}</p>
            <p><strong>Total Deposit was:</strong> LKR ${depositAmount}</p>
            <p>Please review and update the deposit amount.</p>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Low balance email sent to HRs: ${hrEmails.join(', ')}`);
    } catch (error) {
        console.error('Error sending low balance email:', error);
    }
};
