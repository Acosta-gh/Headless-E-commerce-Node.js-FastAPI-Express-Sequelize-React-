const resetPasswordEmail = (name, resetLink) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #2980b9;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Reset Your Password</h1>
        
        <p>Hi ${name},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <a href="${resetLink}" class="button">Reset Password</a>
        
        <div class="warning">
          <strong>⏰ Important:</strong> This link will expire in 15 minutes for security reasons.
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3498db;">${resetLink}</p>
        
        <p><strong>Didn't request this?</strong> You can safely ignore this email. Your password won't be changed.</p>
        
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>If you have any questions, contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { resetPasswordEmail };