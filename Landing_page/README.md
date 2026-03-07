# DropiQ Landing Page

A modern, responsive landing page for DropiQ with waitlist functionality.

## Features

- **Responsive Design**: Works on all devices with a modern, glass-morphism UI
- **Waitlist System**: Users can join the waitlist with email validation
- **Success Popup**: Beautiful confirmation modal when users successfully join
- **Email Storage**: All waitlist emails are automatically stored in an Excel file
- **Duplicate Prevention**: Prevents the same email from being registered multiple times

## Waitlist Functionality

### How it Works

1. **User Input**: Users enter their email in any of the CTA email bars throughout the site
2. **Validation**: Email is validated for proper format
3. **Storage**: Valid emails are stored in `waitlist_emails.xlsx` with timestamps
4. **Success Popup**: Users see a beautiful confirmation modal
5. **Duplicate Prevention**: If an email is already registered, users get a friendly message

### Technical Details

- **API Endpoint**: `/api/waitlist` handles email submissions
- **Excel Storage**: Uses `xlsx` library to create and manage Excel files
- **File Location**: `waitlist_emails.xlsx` is created in the project root
- **Data Structure**: Excel file contains "Email" and "Date Added" columns
- **Error Handling**: Comprehensive error handling for various scenarios

### CTA Locations

The waitlist form appears in multiple locations:
- Hero section
- Demo video section
- Pricing teaser section
- Final CTA section
- Navigation bar

## Development

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

```bash
pnpm install
```

### Running Development Server

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

## File Structure

```
├── components/
│   ├── waitlist-form.tsx      # Main waitlist form component
│   ├── success-popup.tsx      # Success confirmation modal
│   └── ...
├── app/
│   └── api/
│       └── waitlist/
│           └── route.ts       # API endpoint for waitlist
└── waitlist_emails.xlsx       # Generated Excel file (not in git)
```

## Notes

- The `waitlist_emails.xlsx` file is automatically generated and is excluded from version control
- Each email submission includes a timestamp for tracking
- The system prevents duplicate email registrations
- All CTA forms throughout the site use the same waitlist functionality