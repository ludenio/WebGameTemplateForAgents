## 🧭 Workshop Agenda

In this workshop, you will go from a game idea to a playable link you can share with other people.

You will:

1.  Create or open the accounts and apps you need.
2.  Make your own copy of the game template.
3.  Ask an AI Agent to turn your idea into a small browser game.
4.  Open the game on your computer and make changes to it.
5.  Publish the game online with one simple command.

The main goal is not only to make a game. The goal is to add new tools to your personal "inventory": tools you can later use for many different tasks. For example, you can use an AI agent to automate something you often do by hand, create an autochecker for things that need to be free of mistakes, build a website or app, or simply build something fun.

---

## 🎨 Basic Concepts: Developer Dictionary

Before installing anything, let's quickly understand what we are working with:

* **Git:** A “save history” system for a whole folder. If the AI changes something and the game breaks, Git can help you go back to an earlier working version.
* **GitHub:** A cloud service for storing projects. Think of it like Google Drive or Dropbox, but made especially for code and project files.
* **GitHub Desktop:** A friendly app with buttons for GitHub. It lets you download the template and save changes without typing Git commands.
* **Codex App (or Cursor / VS Code):** The app where you open the game folder and talk to the AI assistant. You do not need to read or understand the code yourself.
* **Agent:** The AI assistant inside Codex / Cursor / VS Code. It is very similar to ChatGPT in a browser: you write a message, and it answers. The difference is that this Agent can also change files inside the project folder on your computer. You describe what you want in normal language, and the Agent edits the project files for you.
* **Terminal:** An app where commands can be typed. In this guide, you only need it for one publishing command, and you can ask the Agent to help with it.

---

## 🛠 Step 1. Create a GitHub Account

1.  Go to **github.com**.
2.  Click the white **Sign up** button in the top-right corner.
3.  Enter your email, create a strong password, and choose a username.
4.  GitHub will send a verification code to your email. Enter it on the website. Now you have a profile where your games can live.

## 🚛 Step 2. Install GitHub Desktop

This app is useful for downloading templates and saving your game projects on your computer.

1.  Go to **desktop.github.com**.
2.  Download the installer for your operating system and install it.
3.  On first launch, click **Sign in to GitHub.com**.
4.  A browser window will open. Click the green **Authorize desktop** button to connect GitHub Desktop to your new GitHub account.

## 🤖 Step 3. Install Codex

1.  Download the **Codex** installer. It is usually available from the official OpenAI website or through an early-access link if it is still in beta. *Cursor or VS Code with a Copilot-like plugin can also be used as alternatives.*
2.  Install the app on your computer.
3.  When the app starts, sign in with your OpenAI account — the same login and password you use for ChatGPT.

## 🎨 Step 4. Create Your Own Project from the Template

We will not write the game from scratch. Instead, we will use a starter template that already contains the rules the AI Agent should follow.

1.  Open the template page in your browser: `https://github.com/ludenio/WebGameTemplateForAgents`
2.  Click the green **Use this template** button → then click **Create a new repository**. On GitHub, a “repository” simply means a project folder stored online.
3.  In the *Repository name* field, enter the name of your game, for example `my-awesome-game`, and click **Create repository**.
4.  You are now on the page of your own copy of the project. Click the green **Code** button and choose **Open with GitHub Desktop**.
5.  GitHub Desktop will open and ask where to save the game folder. Choose a convenient location on your computer and click **Clone**. “Clone” just means “download this project to my computer.”

## 🚀 Step 5. Work in Codex: Create the Game

Now the magic begins. Your job is to generate ideas; the Agent will do the technical work.

1.  Open the installed **Codex** app.
2.  Click **Open Folder** and choose the game folder you just downloaded through GitHub Desktop.
3.  Open the file **`FIRST_PROMPT.md`** inside the project folder. You can open it in Codex or in any text editor.
4.  Find the place in the file where it asks for your game idea. Replace that text with your own idea: how the game looks, what the player does, and who the main character is. You can write in simple language. For example: “Top-down view: the character explores a small island, collects coins, helps villagers find lost items, unlocks new areas, and upgrades tools to move faster.”
5.  Copy the whole text from this file and send it to the Agent in the Codex chat.

The Agent will read the project instructions and work in 4 steps:

* **Step 1: Design** — writes the game design document and saves it to `DESIGN.md`.
* **Step 2: Planning** — creates the task list in `TODO.md`.
* **Step 3: Coding** — writes the actual game code inside the `src/` folder.
* **Step 4: Tests** — writes and checks tests inside the `tests/` folder.

*If your idea does not fit the technical rules of the template, for example if you ask for multiplayer and the template does not support it, the Agent will warn you in advance and suggest alternatives.*

## 🎮 Step 6. How to Play and Make Changes

* **How to run the game:** No servers are needed. Open the game folder on your computer, go into the `src` folder, and double-click **`index.html`**. The game will open in your browser.
* **How to change the game:** Open **`NEXT_ITERATION_PROMPT.md`**, write what you want to change, and send the full text to the Agent in a new chat. For example: “Add coins, a small shop, and three upgrades: faster movement, bigger backpack, and a magnet that pulls nearby coins toward the player.”

To create a new chat in Codex, find your game folder in the app, hover over it, and click the notebook-with-pencil icon. You can think of it like this: many chats can work with the same project folder. The Agent will update the documents and carefully change the code for you.

---

## 🌐 Step 7. Publish the Game with Surge

When the game already runs on your computer and you want to send a link to a friend, the simplest option is to publish the `src` folder with **Surge**.

Surge is a service that puts simple websites online. Our game is a simple website made from files in the `src` folder. Publishing is usually done with one terminal command:

```bash
npx surge ./src my-game-name.surge.sh
```

After that, the game will be available at:

```text
https://my-game-name.surge.sh
```

Here, `npx` is just a helper command that runs Surge. You do not need to understand how it works.

### 7.1. What You Need to Know Before Publishing

Surge may ask for:

* **email** — used to create or log into a Surge account. You can use your real email, a separate email for experiments, or an email alias. A fake-looking email may work for a throwaway experiment, but you may not be able to recover the account later.
* **password** — create a new password just for Surge. Do not reuse your GitHub, email, or social media password.
* **domain** — the public site address, for example `my-coin-quest.surge.sh`.

These details go only to **Surge**. They are not written into the game code. Other players will only see the final public link.

### 7.2. How to Ask Your AI Agent to Publish the Game

Open a chat with the Agent in Codex / Cursor / VS Code and send this text. You do not need to understand every technical word inside it — the text is written for the Agent. Replace the values in `{curly braces}` with your own:

```text
Publish my browser game with Surge.

Important:
- the game is inside the src folder;
- publish only ./src, not the whole project folder;
- if Node.js or npx is not installed, explain in simple words how I can install it;
- if the terminal asks for email/password/domain for Surge, stop and ask me to enter them myself. Do not invent a password and do not save the password into project files.

My Surge details:
- email: {YOUR_EMAIL_OR_SEPARATE_EMAIL}
- domain: {GAME_NAME}.surge.sh

I will provide the password myself if Surge asks for it.

After publishing, tell me the final game link.
```

### 7.3. If You Want to Run the Command Yourself

Open a terminal in the project folder and run:

```bash
npx surge ./src my-game-name.surge.sh
```

Here, `my-game-name` is a short name for your game using Latin letters and no spaces. For example:

```bash
npx surge ./src my-coin-quest.surge.sh
```

If Surge asks:

```text
email:
password:
domain:
```

enter your email, a new password for Surge, and a domain like `your-game-name.surge.sh`.

### 7.4. How to Update the Online Game After New Changes

Every time Codex changes the game and you want to update the online version, run the same command again:

```bash
npx surge ./src my-game-name.surge.sh
```

Surge will upload the files again, and after a few seconds the link will open the new version of the game.

---

### Workshop Recap

During this workshop, you created a small project, asked an AI Agent to work with files on your computer, tested the result in a browser, changed the project through another prompt, and published it online as a shareable link.

The most important takeaway is this: you now have a new set of tools in your personal inventory.

You can use the same approach later to:

* automate tasks you often repeat by hand;
* check files, text, data, or project rules where mistakes often happen;
* create a simple game, website, app, prototype, or personal tool;
* experiment, learn, and have fun making things faster than before.

You do not need to become a professional programmer overnight. Just start building by asking your agent. The more you practice, the better you will understand what an AI Agent can do for you.

### What Next?

After you get comfortable and make a few iterations of your game, you may become curious about how everything works. You can read the files inside the project or ask Codex questions about them. Step by step, this will help you move beyond the basic “ask in chat → receive an answer” workflow.
