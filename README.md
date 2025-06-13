# Password-security-checker

A modern Chrome extension for evaluating password strength with crack probability estimation.

## Overview

This Chrome extension helps users create stronger passwords by providing real-time feedback on password strength and vulnerability. The extension analyzes passwords against common databases and security criteria to give accurate strength assessments.

## Features

- Real-time password strength evaluation
- Color-coded visual strength indicators (weak, fair, good, strong)
- Estimation of crack probability with helpful messages
- Password requirement checklist:
  - Minimum length (8 characters)
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
  - No spaces
- User-friendly popup interface
- Secure operation (only requires activeTab permission)

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the project directory
5. The extension should now appear in your browser toolbar

## How It Works

The extension evaluates passwords using multiple criteria:
- Length and character variety
- Presence of uppercase, lowercase, numbers, and special characters
- Comparison against common password databases
- Entropy calculation

The scoring system assigns points based on these criteria, with a maximum score of 100:
- Length contributes significantly to the score
- Special characters add 20 points
- Uppercase letters and digits add 10 points each
- Additional points from entropy calculation

## Password Strength Levels

- **Weak** (<40%): Easy to crack - please choose a stronger password
- **Fair** (40-60%): Could be stronger - add more complexity
- **Good** (60-80%): Moderately strong password
- **Strong** (>80%): Very difficult to crack - excellent password!

## Files Structure

- `manifest.json`: Extension configuration
- `popup.html` & `popup.js`: User interface and interaction logic
- `content.js`: Injects the checker into web pages
- `commonPasswords.js`: Database of vulnerable passwords
- `style.css`: Styling for UI elements
- `icons/`: Extension icons in various sizes

## Password Security Tips

- Use a phrase you can remember
- Mix letters, numbers, and symbols
- Don't use personal information
- Use different passwords for different sites

## Version

Current version: 1.2

## License

[Add your license information here]
