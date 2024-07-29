# Discord-SvS-Leaderboard-Bot\n\nLeaderboard system for managing the SvS League in Diablo Dueling Leagues.\n

Leaderboard system for managing the SvS League in Diablo Dueling Leagues.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Introduction
This bot manages the leaderboard system for the SvS League in Diablo Dueling Leagues. It allows players to add users, create challenges, report wins, and more.

## Features
- User management
- Challenge management
- Automatic leaderboard updates
- Persistent storage with SQLite

## Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)
- A Discord bot token
- A Google Cloud Service Account for authentication (optional)

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/Davenads/Discord-SvS-Leaderboard-Bot.git
    cd Discord-SvS-Leaderboard-Bot
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your Discord bot token:
    ```env
    DISCORD_TOKEN=your_discord_token
    ```

4. Run the bot:
    ```bash
    node index.js
    ```

## Usage
Once the bot is running, it will respond to specific commands within your Discord server. Ensure the bot has the necessary permissions to read and send messages in the channels you intend to use it in.

## Commands
- `!adduser`: Add a new user to the leaderboard.
- `!challenge`: Challenge another user.
- `!reportwin`: Report a win against another user.
- `!leaderboard`: Display the current leaderboard.

## Configuration
The bot uses a configuration file `config.json` for various settings such as command prefixes and database file paths. Ensure you have the correct configuration before running the bot.

## Contributing
We welcome contributions! Please fork the repository and submit a pull request.

### Steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

