# Bulk Certificate Generator

A web-based tool for generating certificates in bulk from a certificate template and a participant list.

The application allows users to upload a custom certificate template, import participant names from Excel or CSV files, customize the participant name appearance and position, preview the result, and generate all certificates together as a ZIP file.

## Features

- Upload a custom JPG or PNG certificate template
- Use a sample certificate template
- Import participant names from Excel, XLS, or CSV files
- Automatically generate certificates for all participants
- Drag and position the participant name on the certificate
- Customize:
  - Font family
  - Font weight
  - Font size
  - Text color
- Generate a final certificate preview
- Automatically create individual certificate filenames using participant names
- Configure the ZIP filename
- Download all generated certificates as a single ZIP file
- Remove the uploaded participant list
- Start a new batch without rebuilding the project

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- XLSX
- html-to-image
- JSZip

## How It Works

1. Upload or select a certificate template.
2. Upload an Excel, XLS, or CSV file containing participant names.
3. Select a participant to configure and preview the certificate.
4. Adjust the name position by dragging it on the certificate.
5. Customize the font, weight, size, and text color.
6. Configure the ZIP and certificate filename formats.
7. Generate all certificates.
8. The application creates the certificates and downloads them together as a ZIP file.

## Local Setup

### Requirements

- Node.js
- npm

### Installation

Clone the repository and open the project directory:

```bash
cd bulk-certificate-generator
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

To verify the project before deployment:

```bash
npm run build
```

To start the production server after building:

```bash
npm start
```

## Project Structure

```text
bulk-certificate-generator/
├── app/
│   ├── page.tsx
│   └── ...
├── public/
│   └── certificate-template.png
├── package.json
├── package-lock.json
├── next.config.ts
└── tsconfig.json
```

## Output

The generated certificates are packaged into a ZIP file.

Example:

```text
AITR_Certificates_2026.zip
```

The ZIP can contain files such as:

```text
AITR_Certificate_Juned_Shaikh.png
AITR_Certificate_Rahul_Sharma.png
AITR_Certificate_Aman_Verma.png
```

## Purpose

This project demonstrates a simple client-side workflow for automating repetitive certificate generation using a certificate template and structured participant data.
