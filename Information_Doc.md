

Buy a custom domain (e.g., .com or .in) to ensure OTP emails are successfully delivered to users' main inboxes. Without a custom domain or a credit card on Render (to unblock SMTP), third-party email providers (like Resend/Brevo/SendGrid) will cause OTPs sent from a generic @gmail.com address to drop into the Spam folder due to strict DMARC policies.