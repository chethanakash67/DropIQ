1. appscript problem for google form to be in auto sync.

2. cache and cart is not resetting in user dashboard.add offline stores also in seaerch page, add some more filters

3. google auth by creating app passwords and otp page

<!-- change the UI and functionality of know how much will you save (like the data preprocessing needed), and view recommendations (ML model to train the user's pattern and suggest combos.) -->

/*preprocess the data first, and add the needed columns, for all the algorithm to work.*/

/*work on search classification, and correct applying of filter, same for both offline and online stores - ML model / gemini API for each product.*/

<!-- create a product page for each product for offline store -->

4. scrape offline stores data, and make like a storeID is fixed to that store, and you need to market by giving that ID to shopkeeper - mainly to nearby locations.

<!-- adding google maps scrapper to fetch the data of the particular shop directly to be register there in the gooogle fomrs, and he'll get the otp directly.

image capturing to just put the product invoice and from there, this must fetch the data completely -->


<!-- creating a seller dashboard for this dropiq -->

<!-- linking the landing page, dashboard auth and seller auth -->

more data to be added about the stores

add email confirmations each time of login


value score in the search page will only work for online stores for now - give that info in the UI.



pro accc - 523cs0014@iiitk.ac.in - google signin
normal acc - saividesh29@gmail.com - google signin


add more stores with scrappers

user's data return update logic to db

recommendation engine + normalised formula 

know how much you'll save option

Add data freshness labels. Every price shown should display "Updated today" or "Updated 3 days ago." This builds trust. Without it, users don't know if the ₹2,800 price is from this morning or 6 months ago. For your scraped sources this is easy — just store the scrape timestamp and display it.
Add a simple product comparison view. Side by side: two products, their DropIQ scores, their individual feature scores across your 5–7 dimensions, and their prices. This is the feature that makes the score engine tangible — users can see exactly why Product A scored higher than Product B. This is what Smartprix doesn't do and what justifies DropIQ's existence.

Add barcode scanner. This is phase 2 in the roadmap but actually very easy to implement and creates an immediate "wow" moment. User scans a barcode at a store, gets the product's DropIQ score and online prices instantly. Even without offline store prices, this is useful — it tells someone standing in Croma whether the price they're about to pay is the market price. HTML5 BarcodeDetector API or a library like ZXing handles this with minimal code. - only if possible.

Buy a custom domain (e.g., .com or .in) to ensure OTP emails are successfully delivered to users' main inboxes. Without a custom domain or a credit card on Render (to unblock SMTP), third-party email providers (like Resend/Brevo/SendGrid) will cause OTPs sent from a generic @gmail.com address to drop into the Spam folder due to strict DMARC policies.