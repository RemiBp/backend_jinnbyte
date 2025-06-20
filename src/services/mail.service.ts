import {
  SendEmailRequest,
  SendEmailCommand,
  CreateTemplateCommand,
  SendTemplatedEmailCommand,
  AlreadyExistsException,
  UpdateTemplateCommand,
} from '@aws-sdk/client-ses';
import { SES } from '../factories/ses.factory';
import dotenv from 'dotenv';

dotenv.config();

export async function sendOTPEmail(email: string, otp: string, purpose: string) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = 'Support';
  const sender = `${senderName} <${senderEmail}>`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif
          background-color: #f4f4f4
          margin: 0
          padding: 0
        }
        .container {
          width: 100%
          padding: 20px
          background-color: #ffffff
          margin: 50px auto
          max-width: 600px
          border-radius: 8px
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)
        }
        .header {
          background-color: #153685
          padding: 10px
          border-top-left-radius: 8px
          border-top-right-radius: 8px
          text-align: center
          color: #ffffff
        }
        .header h1 {
          margin: 0
          font-size: 24px
        }
        .content {
          padding: 20px
          text-align: center
        }
        .content p {
          font-size: 16px
          color: #333333
        }
        .otp {
          font-size: 24px
          font-weight: bold
          background-color: #f0f0f0
          padding: 10px
          border-radius: 5px
          margin: 10px 0
          display: inline-block
          cursor: pointer
        }
        .otp:hover {
          background-color: #e0e0e0
        }
        .copy-message {
          font-size: 14px
          color: #4caf50
          display: none
        }
        .footer {
          margin-top: 20px
          padding: 10px
          text-align: center
          font-size: 12px
          color: #777777
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your OTP Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Please use the OTP code below for <strong>${purpose}</strong>:</p>
          <div id="otp" class="otp" onclick="copyOTP()">${otp}</div>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy 2024 Aire. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log('sendLoginCode called', { email, otp, purpose }, 'MailService');

    const emailParams = {
      Source: sender,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Your OTP for Password Reset`,
        },
        Body: {
          Html: {
            Data: htmlTemplate,
          },
          Text: {
            Data: `Here is your OTP: ${otp} for Resetting your password.`,
          },
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);
    await SES.send(sendEmailCommand);

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error in sendLoginCode', { error, email, otp, purpose }, 'MailService');
    throw error;
  }
}

export async function sendEmailVerificationLink(email: string, verificationLink: string, purpose: string) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = 'Support';
  const sender = `${senderName} <${senderEmail}>`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif
          background-color: #f4f4f4
          margin: 0
          padding: 0
        }
        .container {
          width: 100%
          padding: 20px
          background-color: #ffffff
          margin: 50px auto
          max-width: 600px
          border-radius: 8px
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)
        }
        .header {
          background-color: #153685
          padding: 10px
          border-top-left-radius: 8px
          border-top-right-radius: 8px
          text-align: center
          color: #ffffff
        }
        .header h1 {
          margin: 0
          font-size: 24px
        }
        .content {
          padding: 20px
          text-align: center
        }
        .content p {
          font-size: 16px
          color: #333333
        }
        .content a {
          display: inline-block
          padding: 10px 20px
          background-color: #153685
          color: white
          text-decoration: none
          border-radius: 5px
          font-size: 16px
        }
        .content a:hover {
          background-color: #102A69
        }
        .footer {
          margin-top: 20px
          padding: 10px
          text-align: center
          font-size: 12px
          color: #777777
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
          <a href="${verificationLink}" target="_blank">Verify Email</a>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
        </div>
        <div class="footer">
          <p>If you did not request this email, please ignore it.</p>
          <p>&copy 2024 Playrly. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log('sendEmailVerificationLink called', { email, verificationLink, purpose }, 'MailService');

    const emailParams = {
      Source: sender,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Verify Your Email`,
        },
        Body: {
          Html: {
            Data: htmlTemplate,
          },
          Text: {
            Data: `Thank you for registering. Please use the following link to verify your email: ${verificationLink}`,
          },
        },
      },
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);
    await SES.send(sendEmailCommand);

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error in sendEmailVerificationLink', { error, email, verificationLink, purpose }, 'MailService');
    throw error;
  }
}

export async function sendEmailChangeCode(email: string, loginCode: string) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = 'SENDER';
  const sender = `${senderName} <${senderEmail}>`;

  try {
    console.log('sendEmailChangeCode called', { email, loginCode }, 'MailService');

    const templateData = JSON.stringify({
      loginCode,
    });

    const emailParams = {
      Source: sender,
      Destination: {
        ToAddresses: [email],
      },
      Template: 'TemplateForEmailChangeOTP',
      TemplateData: templateData,
    };

    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand(emailParams);
    await SES.send(sendTemplatedEmailCommand);

    console.log('Templated email sent successfully');
  } catch (error) {
    console.error('Error in sendEmailChangeCode', { error, email, loginCode }, 'MailService');
    throw error;
  }
}

export async function sendEmailForFirstCommentOnNote(
  email: string,
  public_url: string,
  authorName: string,
  comment: string
) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = 'SENDER';
  const sender = `${senderName} <${senderEmail}>`;

  try {
    console.log('sendEmailForFirstCommentOnNote called', { email, public_url, authorName, comment }, 'MailService');
    const templateData = JSON.stringify({
      url: public_url,
      authorName,
      comment,
    });

    const emailParams = {
      Source: sender,
      Destination: {
        ToAddresses: [email],
      },
      Template: 'TemplateForFirstCommentOnNote',
      TemplateData: templateData,
    };

    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand(emailParams);
    await SES.send(sendTemplatedEmailCommand);

    console.log('Templated email sent successfully');
  } catch (error) {
    console.error('Error in sendEmailForFirstCommentOnNote', { error, email, authorName, comment }, 'MailService');
    throw error;
  }
}

export async function sendEmailOnAccountDeletion(email: string) {
  try {
    console.log('sendEmailOnAccountDeletion called', { email }, 'MailService');

    const sendTo = 'email@gmail.com';

    const senderEmail = process.env.SENDER_EMAIL;
    const senderName = 'SENDER';
    const sender = `${senderName} <${senderEmail}>`;

    const emailParams: SendEmailRequest = {
      Destination: {
        ToAddresses: [sendTo],
      },
      Message: {
        Subject: {
          Data: `Account deletion notice`,
        },
        Body: {
          Text: {
            Data: `User ${email} has deleted their account`,
          },
        },
      },
      Source: sender,
      ReplyToAddresses: [sendTo],
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    await SES.send(sendEmailCommand);
  } catch (error) {
    console.error('Error in sendEmailOnAccountDeletion', { error, email }, 'MailService');
  }
}
