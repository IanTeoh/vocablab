# VocabLab 📚

A mobile app for building English vocabulary through a daily word challenge, with streak tracking to build a consistent learning habit.

## Features

- **Word of the Day** — a new word surfaces each day, deterministically selected so everyone sees the same word on the same date
- **Streak tracking** — tracks consecutive days opened, with proper local-date handling to avoid timezone edge cases around midnight
- Built with a clean separation between game logic (pure functions) and UI, making the core logic independently testable

## Tech Stack

- **React Native** (Expo, TypeScript)
- **AsyncStorage** for local persistence
- **Expo Router** for navigation

## Project Structure

## Running Locally

```bash
git clone https://github.com/IanTeoh/vocablab.git
cd vocablab
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android) to run it on your device.

## Roadmap

- [ ] Guess-the-meaning challenge before revealing the definition
- [ ] Tabbed navigation (Today / Coming Soon / Profile)
- [ ] Profile tab with stats (words learned, longest streak)
- [ ] Social/competitive word duels

## Author

Built by Ian Teoh as a personal project to practice full-stack mobile development.
