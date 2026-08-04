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
