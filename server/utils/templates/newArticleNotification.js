export const newArticleNotification = (articleLink, articleTitle) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 22px; color: #111827;">New Article Published!</h2>
    </div>

    <!-- Body -->
    <div style="padding: 20px; color: #374151;">
      <p style="font-size: 16px; margin-bottom: 24px;">
        Hi there! A new article titled 
        <strong>${articleTitle}</strong> has just been published.
      </p>
      <a href="${articleLink}" 
         style="display: inline-block; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        Read Article
      </a>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 12px 20px; text-align: center; font-size: 13px; color: #6b7280;">
      Thanks for subscribing to our newsletter 📬
    </div>

  </div>
`;
