import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// Nodemailer
const sendOTPEmail = async (options: any) => {

  // 1) Dreate transporter (service that will send email like "gmail", "mailgun", "mailtrap", "sendgrid")
  const trasportOptions: SMTPTransport.Options = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // if secure = false ==> port = 587, if secure = true ==> port = 465, both options are the same security level
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { // specify this when using secure: false
      minVersion: "TLSv1.2",
    },
  };
  // const trasportOptions: SMTPTransport.Options = {
  //   host: process.env.EMAIL_HOST,
  //   port: Number(process.env.EMAIL_PORT),
  //   secure: true, // if secure = false ==> port = 587, if secure = true ==> port = 465
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // };

  const transporter = nodemailer.createTransport(trasportOptions);

  // 2) Define email options (like from, to, subject, email content)
  const message = ` 
<head>
    <meta charset="UTF-8">
    <title>Forget Password</title>
    <style>
        /* Inline styles for email compatibility */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        p {
            font-size: 18px;
            margin-block: 16px;
            padding: 0;
        }

        .otp-container {
            display: flex;
            justify-content: center;
        }

        .otp-span {
            /*display: flex;
            width: 45%;*/
            /*background: #4B6E77; our background*/
            background: #3f5a61;
            border-radius: 10px;
            padding: 10px 30px;
            align-items: center !important;
            justify-content: center !important;
            font-size: 25px;
            font-weight: bolder;
            padding-bottom: 7px;
            color: #CB803C;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Hello from <span style="color: #CB803C;">E</span>-Shop App</h1>
        <p>Your one time password (OTP)</p>
        <div class="otp-container"><span class="otp-span">${options.otp}</span></div>
        <p>Please note this is a temporary password and will expire in <b>3 minutes</b>. Do not share this OTP with anyone. E-Shop App takes your account security very seriously.</p>
        <p>If you didn't request a forget password, ignore this email.</p>
    </div>
</body>`;

  const mailOptions = {
    from: `E-Shop App <${process.env.EMAIL_USER}>`, // sender address
    to: options.email, // list of receivers
    subject: `${options.otp} is the OTP for your E-Shop account forget password`, // Subject line
    text: "Forget Password ", // plain text body
    html: message, // html body
  };

  // 3) Send email
  try {
    // await transporter.verify(); ==> not needed. Calling verify() before every email is: Slower - Redundant - Extra SMTP handshake
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("SMTP ERROR:", error);
    throw error;
  }

};

export default sendOTPEmail;
