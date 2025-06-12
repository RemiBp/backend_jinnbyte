import {
  SendEmailRequest,
  SendEmailCommand,
  CreateTemplateCommand,
  SendTemplatedEmailCommand,
  AlreadyExistsException,
  UpdateTemplateCommand,
} from "@aws-sdk/client-ses";
import { SES } from "../factories/ses.factory";
import dotenv from "dotenv";

dotenv.config();

export async function sendLoginCode(email: string, loginCode: string, purpose: string) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = "SENDER";
  const sender = `${senderName} <${senderEmail}>`;

  try {
    console.log("sendLoginCode called", { email, loginCode, purpose }, "MailService");

    const templateData = JSON.stringify({
      loginCode,
      purpose,
    });

    const emailParams = {
      Source: sender,
      Destination: {
        ToAddresses: [email],
      },
      Template: "TemplateForOTP",
      TemplateData: templateData,
    };

    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand(emailParams);
    await SES.send(sendTemplatedEmailCommand);

    console.log("Templated email sent successfully");
  } catch (error) {
    console.error("Error in sendLoginCode", { error, email, loginCode, purpose }, "MailService");
    throw error;
  }
}

export async function sendEmailChangeCode(email: string, loginCode: string) {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = "SENDER";
  const sender = `${senderName} <${senderEmail}>`;

  try {
    console.log("sendEmailChangeCode called", { email, loginCode }, "MailService");

    const templateData = JSON.stringify({
      loginCode,
    });

    const emailParams = {
      Source: sender,
      Destination: {
        ToAddresses: [email],
      },
      Template: "TemplateForEmailChangeOTP",
      TemplateData: templateData,
    };

    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand(emailParams);
    await SES.send(sendTemplatedEmailCommand);

    console.log("Templated email sent successfully");
  } catch (error) {
    console.error("Error in sendEmailChangeCode", { error, email, loginCode }, "MailService");
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
  const senderName = "SENDER";
  const sender = `${senderName} <${senderEmail}>`;

  try {
    console.log("sendEmailForFirstCommentOnNote called", { email, public_url, authorName, comment }, "MailService");

    // Define the template data
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
      Template: "TemplateForFirstCommentOnNote",
      TemplateData: templateData,
    };

    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand(emailParams);
    await SES.send(sendTemplatedEmailCommand);

    console.log("Templated email sent successfully");
  } catch (error) {
    console.error("Error in sendEmailForFirstCommentOnNote", { error, email, authorName, comment }, "MailService");
    throw error;
  }
}

export async function sendEmailOnAccountDeletion(email: string) {
  try {
    console.log("sendEmailOnAccountDeletion called", { email }, "MailService");

    const sendTo = "email@gmail.com";

    const senderEmail = process.env.SENDER_EMAIL;
    const senderName = "SENDER";
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
    console.error("Error in sendEmailOnAccountDeletion", { error, email }, "MailService");
    // throw error;
  }
}

// export async function createLoginCodeTemplate() {
//   const templateName = "TemplateForFirstCommentOnNote"; // A unique name for your template
//   const templateData = {
//     Template: {
//       TemplateName: templateName,
//       SubjectPart: "XYZ ACTION",
//       HtmlPart: `
// <center style="
// width: 100%;
// height: 100%;
// background: #f2f2f2;
// font-family: 'Open Sans', sans-serif;
// ">
//   <table style="
//   width: 100%;
//   padding-top: 30px;
//   padding-bottom: 30px;
//   background: #f7f5ef;
//   border-radius: 0;
//   width: 100%;
//   border-spacing: 0 !important;
//   border-collapse: collapse !important;
//   table-layout: fixed !important;
//   margin: 0 auto !important;
//   box-sizing: border-box;
// " align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
//     <tbody>
//       <tr>
//         <td style="padding: 50px 15px; box-sizing: border-box" valign="middle">
//           <table style="
//           max-width: 660px;
//           margin: 0 auto;
//           box-sizing: border-box;
//           padding-top: 70px;
//           padding-bottom: 70px;
//           padding-left: 0;
//           padding-right: 0;
//           margin: auto;
//           background: #fff;
//           border-radius: 0;
//           width: 100%;
//           border-spacing: 0 !important;
//           border-collapse: collapse !important;
//           table-layout: fixed !important;
//           margin: 0 auto !important;
//           box-sizing: border-box;
//           border: 0;

//         " align="center" role="presentation" cellspacing="0" cellpadding="0" width="100%">
//             <tbody>
//               <tr>
//                 <td style="padding: 0; box-sizing: border-box" valign="middle">
//                   <table style="
//                   width: 100%;
//                   border-spacing: 0 !important;
//                   border-collapse: collapse !important;
//                   table-layout: fixed !important;
//                   margin: 0 auto !important;
//                   text-align: center;
//                 ">
//                     <tbody>
//                       <tr>
//                         <td style="
//                         box-sizing: border-box;
//                         padding: 20px 0;
//                         display: block;
//                         align: center;
//                       ">

//                          INSERT IMAGE HERE

//                         </td>
//                       </tr>

//                       <tr>
//                         <td style="
//                         padding: 20px;
//                         box-sizing: border-box;

//                       ">
//                           <p style="
//                           margin: 0 0 18px;
//                           font-size: 15px;
//                           font-weight: 500;
//                           color: #1b1b1b;
//                           text-align: left;
//                           line-height: 22px;
//                         ">
//                              SOME TEXT HERE
//                           </p>
//                           <div style="
//                           margin: 0 0 18px;
//                           padding: 10px;
//                           text-align: center;
//                         ">
//                             <button
//                               style="
//                               background: #E54B2B;
//                               border: 1px solid #f7f5ef;
//                               border-radius: 5px;
//                               color: #f7f5ef;
//                               display: inline-block;
//                               font-size: 14px;
//                               font-weight: 500;
//                               line-height: 1.5;
//                               padding: 10px 20px;
//                               text-align: center;
//                               text-decoration: none;
//                               cursor: pointer;
//                             ">
//                               <a href="{{ url }}" style="color: #f7f5ef; text-decoration: none;">View</a>
//                             </button>
//                           </div>
//                           <p style="
//                           margin: 0 0 18px;
//                           font-size: 15px;
//                           font-weight: 500;
//                           color: #1b1b1b;
//                           text-align: left;
//                           line-height: 22px;
//                         ">
//                           SOME MORE TEXT HERE
//                           </p>
//                           <p style="
//                           margin: 0 0 18px;
//                           font-size: 15px;
//                           font-weight: 500;
//                           color: #1b1b1b;
//                           text-align: left;
//                           line-height: 22px;
//                         ">
//                             Thanks,
//                           </p>
//                           <p style="
//                           margin: 0 0 20px;
//                           font-size: 15px;
//                           font-weight: 500;
//                           color: #1b1b1b;
//                           text-align: left;
//                           line-height: 22px;
//                           padding-bottom: 15px;

//                         ">
//                             Team ABC
//                           </p>
//                         </td>
//                     </tbody>
//                   </table>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </td>
//       </tr>
//     </tbody>
//   </table>
//   </td>
//   </tr>
//   </tbody>
//   </table>
// </center>`,
//     },
//   };

//   const command = new UpdateTemplateCommand(templateData);

//   try {
//     const response = await SES.send(command);
//     console.log("Email template created successfully:", response);
//     return response; // The response from AWS SES
//   } catch (error) {
//     console.error("Error creating email template:", error);
//     throw error;
//   }
// }

// createLoginCodeTemplate();
