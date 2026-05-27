const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

function getLogoSrc() {
  return process.env.EMAIL_LOGO_URL || "cid:mic_logo";
}

async function sendMail(mailOptions) {
  if (mailOptions.attachments?.length) {
    mailOptions.attachments = mailOptions.attachments.filter(
      (attachment) => attachment && (attachment.cid || attachment.contentDisposition === "inline")
    );
  }

  const skipLogo = mailOptions.skipLogo === true;

  if (!process.env.EMAIL_LOGO_URL && !skipLogo) {
    const candidate = path.join(__dirname, "..", "..", "frontend", "src", "assets", "logo.png");
    if (fs.existsSync(candidate)) {
      mailOptions.attachments = (mailOptions.attachments || []).concat({
        filename: path.basename(candidate),
        path: candidate,
        cid: "mic_logo",
        contentDisposition: "inline",
      });
    }
  }

  await transporter.sendMail(mailOptions);
  logger.info({ to: mailOptions.to, subject: mailOptions.subject }, "Email sent");
}

function baseHeader(title, subtitle) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial,sans-serif;background:#f4f7fa;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f3f7;border-radius:14px;overflow:hidden;">
            <tr style="background:#1a3a52;color:#ffffff;text-align:center;">
              <td style="padding:32px 24px;">
                <img src="${getLogoSrc()}" alt="Logo" style="height:90px;width:auto;display:block;margin:0 auto 18px auto;object-fit:contain;" />
                <h1 style="font-size:22px;margin:0;letter-spacing:2px;color:#ffffff;">MIC - INTELLICA PORTAL</h1>
                <div style="color:#b8bcc4;opacity:0.95;margin-top:10px;font-size:16px;font-weight:500;">${subtitle || "DVR & DR.HS MIC College of Technology"}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 48px;text-align:center;background:#f0f3f7;">
                ${title}
  `;
}

const baseFooter = `
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;font-size:12px;color:#9aa3ae;text-align:center;">
                This is an automated message from MIC - INTELLICA PORTAL. Please do not reply to this email.<br />DVR & DR.HS MIC College of Technology
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

function pendingTemplate(name) {
  return (
    baseHeader(
      `
        <div style="padding:30px 0;text-align:center;">
          <p style="color:#0f2333;margin:0 0 18px 0;font-size:18px;font-weight:700;">Hello ${name}</p>
          <p style="color:#555;max-width:480px;margin:0 auto 18px;line-height:1.6;font-size:15px;font-weight:500;">Thank you for registering with MIC - INTELLICA PORTAL. Your account is currently under review. You will receive an email notification once your account is approved.</p>
          <p style="color:#18a0ff;font-weight:600;margin:16px 0 0 0;font-size:15px;">Welcome aboard.</p>
        </div>
      `,
      ""
    ) + baseFooter
  );
}

function approvedTemplate(name) {
  return (
    baseHeader(
      `
        <div style="padding:30px 0;text-align:center;">
          <p style="color:#0f2333;margin:0 0 18px 0;font-size:18px;font-weight:700;">Hello ${name}</p>
          <p style="color:#2da84a;font-weight:700;margin:0 0 16px 0;font-size:15px;">Your account is approved. You can now log in to the portal.</p>
        </div>
      `,
      ""
    ) + baseFooter
  );
}

function adminNotifyTemplate(name, role, department) {
  return (
    baseHeader(
      `
        <div>
          <h2 style="color:#0f2333;margin:0 0 10px;font-size:20px;">New ${role} Registered</h2>
          <p style="color:#6b7780;margin:12px 0 0;">${name} has registered for ${department || "N/A"} and is awaiting approval.</p>
        </div>
      `,
      ""
    ) + baseFooter
  );
}

async function sendOTP(email, otp) {
  await sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Login",
    text: `Hello,\n\nYour OTP is: ${otp}. It expires in 10 minutes.\n\nPlease do not share it with anyone.`,
    skipLogo: true,
    attachments: [],
  });
}

async function sendRegistrationNotification(userObj) {
  await sendMail({
    from: process.env.EMAIL_USER,
    to: userObj.email,
    subject: "Your account is registered and awaiting approval",
    html: pendingTemplate(userObj.name),
  });

  const admins = await User.find({ role: "ADMIN" }).select("email").lean();
  const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

  if (adminEmails.length) {
    await sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmails.join(","),
      subject: `New ${userObj.role} Registration - ${userObj.name}`,
      html: adminNotifyTemplate(userObj.name, userObj.role, userObj.department),
    });
  }
}

async function sendApprovalEmailToFaculty(faculty) {
  await sendMail({
    from: process.env.EMAIL_USER,
    to: faculty.email,
    subject: "Your Faculty Account Has Been Approved",
    html: approvedTemplate(faculty.name),
  });
}

async function sendApprovalEmailToHod(hod) {
  await sendMail({
    from: process.env.EMAIL_USER,
    to: hod.email,
    subject: "Your HOD Account Has Been Approved",
    html: approvedTemplate(hod.name),
  });
}

module.exports = {
  sendOTP,
  sendRegistrationNotification,
  sendApprovalEmailToFaculty,
  sendApprovalEmailToHod,
};
