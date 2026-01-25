# Google Meet Pixel-Perfect Clone

A high-fidelity, frontend-only React Native application built with Expo that replicates the Google Meet mobile experience.

## ✨ Features

- **Pixel-Perfect UI**: Replicates the layout, colors, and typography of the official Google Meet app.
- **Meeting Flow**:
  - Generate meeting links with a single tap.
  - Join meetings using a code or link.
  - Pre-join preview screen with camera and microphone toggles.
- **Meeting Room**:
  - Dynamic participant video grid (supports up to 6 participants).
  - Active speaker highlight with subtle animations.
  - Top Bar with meeting info, camera flip, and audio source controls.
  - Bottom Control Bar with premium icon styling and layouts.
- **Collaboration**:
  - Jamboard-style Whiteboard with pen, color, and size tools.
  - Screen sharing UI simulation.
- **Frontend-Only**: Fully self-contained with simulated participant logic; no backend required for demonstration.

## 📂 Folder Structure

```
client/
├── assets/             # Images and static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── MeetingControls.js
│   │   ├── ParticipantList.js
│   │   ├── VideoView.js
│   │   └── Whiteboard.js
│   ├── navigation/     # React Navigation configuration
│   │   └── AppNavigator.js
│   ├── screens/        # Main application screens
│   │   ├── HomeScreen.js
│   │   ├── JoinScreen.js
│   │   └── MeetingScreen.js
│   ├── theme/          # Global styles, colors, and typography
│   │   └── theme.js
│   └── services/       # Simulation and service logic
├── App.js              # Application entry point
└── app.json            # Expo configuration
```

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js installed on your machine.
- Expo Go app on your mobile device (for native testing) or a modern web browser.

### Installation
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
- **For Web**:
  ```bash
  npm run web
  ```
- **For Android/iOS (Expo Go)**:
  ```bash
  npx expo start
  ```
  Scan the QR code with your phone to view the app.

## 🛠 Technical Details
- **Framework**: React Native with Expo.
- **Navigation**: React Navigation (Native Stack).
- **Icons**: Lucide React Native.
- **Graphics**: React Native SVG.
- **Styling**: Standardized Google Material-style theme system.

---
*Created with focus on visual excellence and production-quality code.*
