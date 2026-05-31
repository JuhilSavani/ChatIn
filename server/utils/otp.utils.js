import { google } from "googleapis";
import { getRedis } from "../config/redis.config.js";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID; 
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET; 
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI; 
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN; 
const SENDER_EMAIL = process.env.SENDER_EMAIL; 

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const encodeMessage = (message) => {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const buildRawEmail = ({ from, to, subject, html }) => {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
  ];

  const message = `${headers.join("\r\n")}\r\n\r\n${html}`;
  return encodeMessage(message);
};

/**
 * Generates a 6-digit OTP, stores it in Redis with a 5-minute TTL,
 * and sends it to the specified email address via Gmail.
 * @param {string} email - Recipient email address.
 * @returns {Promise<boolean>} - Returns true on success.
 */
export const sendOTP = async (email) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const redis = getRedis();

  // Store in Redis with 5 minute TTL (300 seconds)
  await redis.set(`otp:${email}`, verificationCode, "EX", 300);

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const raw = buildRawEmail({
    from: `ChatIn <${SENDER_EMAIL}>`,
    to: email,
    subject: "Verify Your Email Address With ChatIn",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          h1 { color: #333; font-size: 26px; margin-bottom: 20px; }
          p { font-size: 16px; line-height: 1.6; margin: 10px 0; color: #333; }
          .verification-code {
            font-size: 20px; font-weight: bold; padding: 0.25rem 0.5rem;
            border-radius: 2px; background-color: #333; color: #FFD369;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verification</h1>
          <p>Your verification code is: <span class="verification-code">${verificationCode}</span></p>
          <p>Please enter this code on the verification page to complete your registration.</p>
          <p>If you did not sign up for ChatIn, please ignore this email.</p>
          <p>Thank you</p>
          <p>The ChatIn Team</p>
        </div>
      </body>
      </html>
    `,
  });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return true;
};

/**
 * Verifies the provided OTP against the one stored in Redis for the given email.
 * Deletes the OTP from Redis if it matches.
 * @param {string} email - The email address associated with the OTP.
 * @param {string} code - The code to verify.
 * @returns {Promise<boolean>} - Returns true if verified, false otherwise.
 */
export const confirmOTP = async (email, code) => {
  if (!code) return false;
  const redis = getRedis();
  const storedCode = await redis.get(`otp:${email}`);

  if (storedCode && storedCode === code.toString()) {
    await redis.del(`otp:${email}`);
    return true;
  }
  return false;
};
