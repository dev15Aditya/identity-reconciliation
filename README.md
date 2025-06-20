# identity-reconciliation

About
This system helps businesses recognize customers across multiple purchases, even when they use different contact details (like different emails or phone numbers). It automatically links customer records when it finds matching information.

How It Works
First Contact: When a new customer makes a purchase, the system creates a profile

Future Purchases: If the same customer uses different contact info, the system:

Links new info to their existing profile

Keeps all their contact details together

Smart Matching: Works with just an email, just a phone number, or both

Setup
Install dependencies:

bash
npm install
Set up your database in the .env file

Run the database setup:

bash
npx prisma migrate dev
Start the server:

bash
npm run dev
Using the API
Send customer details to:

text
POST /identify
Example Request:

json
{
"email": "customer@example.com",
"phoneNumber": "1234567890"
}
Example Response:

json
{
"contact": {
"primaryContactId": 1,
"emails": ["customer@example.com", "other@example.com"],
"phoneNumbers": ["1234567890"],
"secondaryContactIds": [2]
}
}
Key Features
Automatically links customer profiles

Handles partial information (just email or just phone)

Prevents duplicate records

Simple REST API interface

Need Help?
