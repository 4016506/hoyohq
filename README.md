# Genshin Impact Character Tracker

A sleek and modern web application for tracking your Genshin Impact character progress with your friends. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Multi-User Support**: Create and manage multiple user profiles
- **Character Database**: Complete database of all Genshin Impact characters
- **Progress Tracking**: Track character status (Unowned, WIP, Built), constellation levels (C0-C6), refinement levels (R0-R5), and weapon names
- **Filtering & Sorting**: Filter by nation, vision, weapon, rarity, and status. Sort by any column
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful glassmorphism design with Genshin Impact-inspired colors
- **Local Storage**: Data persists between sessions (Firebase integration ready)

## Character Data

Each character includes:
- **Name**: Character name
- **Rarity**: 4★ or 5★
- **Nation**: Mondstadt, Liyue, Inazuma, Sumeru, Fontaine, Natlan, Nod-Krai
- **Vision**: Pyro, Hydro, Cryo, Dendro, Electro, Anemo, Geo
- **Weapon**: Sword, Bow, Catalyst, Claymore, Polearm

## User Character Tracking

For each character, users can track:
- **Status**: 
  - Unowned (gray) - Character not owned
  - WIP (yellow) - Work in progress
  - Built (green) - Fully built character
- **Constellation Level**: C0 through C6 (only available if not Unowned)
- **Refinement Level**: R0 through R5 (only available if not Unowned)
- **Weapon Name**: Custom weapon name for each character (only available if not Unowned, defaults to "N/A")

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hoyohq
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Firebase Setup (Optional)

To enable cloud synchronization:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Update the Firebase configuration in `src/config/firebase.ts` with your project credentials
4. The app will automatically use Firebase instead of localStorage

## Usage

1. **Create Users**: Click "Add New User" to create profiles for you and your friends
2. **Select User**: Choose which user's progress you want to view/edit
3. **Track Progress**: 
   - Use the status dropdown to mark characters as Unowned, WIP, or Built
   - Set constellation and refinement levels for owned characters
   - Enter custom weapon names for each character
4. **Filter & Sort**: Use the filter dropdowns to find specific characters
5. **View Stats**: Check the summary cards to see your overall progress

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Firebase** - Backend (optional)
- **React Router** - Navigation

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── UserSelector.tsx # User management
│   └── CharacterTable.tsx # Character table
├── config/             # Configuration files
│   └── firebase.ts     # Firebase setup
├── data/               # Static data
│   └── characters.ts   # Character database
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
└── App.tsx             # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for personal use. Genshin Impact is a trademark of miHoYo Co., Ltd.

## Future Enhancements

- [ ] Artifact tracking
- [ ] Talent level tracking
- [ ] Team composition builder
- [ ] Character comparison tools
- [ ] Achievement tracking
- [ ] Wish history integration