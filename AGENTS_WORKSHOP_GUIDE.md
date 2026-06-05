> **Prefer clicking to reading?** Open the [Workshop Console](docs/index.html) — it builds and copies every prompt in this guide for you. When the repo is published on GitHub Pages, it also lives at `https://<user>.github.io/<repo>/`.

## 🧭 Workshop Agenda

In this workshop, you will go from a game idea to a playable link you can share with other people.

You will:

1.  Create or open the accounts and apps you need.
2.  Make your own copy of the game template.
3.  Ask an AI Agent to turn your idea into a small browser game.
4.  Open the game on your computer and make changes to it.
5.  Ask the Agent to publish the game online so other people can play it by link.

The main goal is not only to make a game. The goal is to add new tools to your personal "inventory": tools you can later use for many different tasks. For example, you can use an AI agent to automate something you often do by hand, create an autochecker for things that need to be free of mistakes, build a website or app, or simply build something fun.

---

## 🎨 Basic Concepts: Developer Dictionary

Before installing anything, let's quickly understand what we are working with:

* **Git:** A “save history” system for a whole folder. If the AI changes something and the game breaks, Git can help you go back to an earlier working version.
* **GitHub:** A cloud service for storing projects. Think of it like Google Drive or Dropbox, but made especially for code and project files.
* **GitHub Desktop:** A friendly app with buttons for GitHub. It lets you download the template and save changes without typing Git commands.
* **Agent app:** An app where you open the game folder and talk to the AI assistant. Use any agent app that can read and edit files in a local folder. You do not need to read or understand the code yourself.
* **Agent:** The AI assistant inside your agent app. It works like a chat: you write a message, and it answers. The difference is that this Agent can also change files inside the project folder on your computer. You describe what you want in normal language, and the Agent edits the project files for you.
* **Terminal:** An app where commands can be typed. In this guide, you do not need to use it directly for the main path. The Agent may use it for you and ask you to approve actions.

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

## 🤖 Step 3. Install an Agent App

1.  Choose an agent app that can open a local project folder, edit files, and run terminal commands after you approve them. If a workshop host, teacher, or team gave you a specific app, use that one.
2.  Install the app on your computer.
3.  When the app starts, sign in with the account required by that app.

## 🎨 Step 4. Create Your Own Project from the Template

We will not write the game from scratch. Instead, we will use a starter template that already contains the rules the AI Agent should follow.

1.  Open the template page in your browser: `https://github.com/ludenio/WebGameTemplateForAgents`
2.  Click the green **Use this template** button → then click **Create a new repository**. On GitHub, a “repository” simply means a project folder stored online.
3.  In the *Repository name* field, enter the name of your game, for example `my-awesome-game`, and click **Create repository**.
4.  You are now on the page of your own copy of the project. Click the green **Code** button and choose **Open with GitHub Desktop**.
5.  GitHub Desktop will open and ask where to save the game folder. Choose a convenient location on your computer and click **Clone**. “Clone” just means “download this project to my computer.”

## 🚀 Step 5. Work in Your Agent App: Create the Game

Now the magic begins. Your job is to generate ideas; the Agent will do the technical work.

1.  Open the installed agent app.
2.  Click **Open Folder** and choose the game folder you just downloaded through GitHub Desktop. If you do not see this button, use the application menu instead: **File** → **Open Folder**.
3.  Open the [Workshop Console](docs/index.html) (tab **1. Create your first game**) **or** the file **`FIRST_PROMPT.md`** in the project folder.
4.  Describe your game idea: how it looks, what the player does, and who the main character is. You can write in simple language. For example: “Top-down view: the character explores a small island, collects coins, helps villagers find lost items, unlocks new areas, and upgrades tools to move faster.” The console has fields and example concepts; `FIRST_PROMPT.md` has a quality checklist and good/bad concept examples.
5.  Copy the assembled prompt (from the console’s **Copy prompt** button) or the whole text between the `---` lines in `FIRST_PROMPT.md`, and send it to the Agent in your agent chat.

The Agent will read the project instructions and work in 4 steps:

* **Step 1: Design** — writes the game design document and saves it to `DESIGN.md`.
* **Step 2: Planning** — creates the task list in `TODO.md`.
* **Step 3: Coding** — writes the actual game code inside the `src/` folder.
* **Step 4: Tests** — writes and checks tests inside the `tests/` folder.

*If your idea does not fit the technical rules of the template, for example if you ask for multiplayer and the template does not support it, the Agent will warn you in advance and suggest alternatives.*

When the Agent shows you `DESIGN.md`, `TODO.md`, or another checkpoint and asks whether to continue, you can approve the next step with:

```text
I approve, continue.
```

Use that only when the result looks good enough to continue. If something is wrong, ask the Agent to change it before approving.

## 🎮 Step 6. How to Play and Make Changes

* **How to run the game:** No servers are needed. Open the game folder on your computer, go into the `src` folder, and double-click **`index.html`**. The game will open in your browser.
* **If something looks broken:** refresh the page, make sure you opened `src/index.html` (not a copy in another folder), and paste any error message from the browser back to the Agent so it can fix the project.
* **How to change the game:** Open the [Workshop Console](docs/index.html) (tab **2. Change a game**) **or** **`NEXT_ITERATION_PROMPT.md`**, describe what you want to change, copy the prompt, and send it to the Agent in a new chat. For example: “Add coins, a small shop, and three upgrades: faster movement, bigger backpack, and a magnet that pulls nearby coins toward the player.”

To create a new chat, look for a button named **New Chat**, **New Task**, **New Conversation**, or something similar in your agent app. You can think of it like this: many chats can work with the same project folder. The Agent will update the documents and carefully change the code for you.

---

## 🌐 Step 7. Ask the Agent to Publish the Game

When the game already runs on your computer and you want to send a link to a friend, ask the Agent to publish it for you.

This step shows an important idea: an Agent can do more than write text and edit project files. It can also use tools, run terminal commands, check what is installed on your computer, and guide you through missing setup.

For this workshop we will use **Surge**, a service that puts simple websites online. You do not need to open the terminal yourself. Copy the prompt below, answer the Agent's questions, and approve actions when your agent app asks you to.

### 7.1. Before You Ask the Agent

Prepare three things:

* **email** — used to create or log into a Surge account.
* **password** — create a new password just for Surge. Do not reuse your GitHub, email, or social media password. This is not a "system password" from the guide.
* **domain** — the public site address, for example `my-coin-quest.surge.sh`.

Other players will only see the final public link. These details are not written into the game code.

### 7.2. Copy This Prompt to the Agent

Replace the values in `{curly braces}` with your own:

```text
Publish my browser game on the web with Surge so I can send a playable link to a friend.

Important:
- the game is inside the src folder;
- publish only ./src, not the whole project folder;
- use your tools and terminal access to do the publishing for me, not just explain the commands;
- first check whether node and npx are installed;
- if node or npx is missing, help me install the Node.js LTS version for my operating system, then check again;
- when ready, run: npx --yes surge ./src {GAME_NAME}.surge.sh;
- if my agent app asks me to approve a command, wait for my approval;
- if Surge asks for email or domain, you may enter the values below;
- if Surge asks for a password, stop and tell me exactly where to type it myself;
- do not invent a password and do not save the password into project files.

My Surge details:
- email: {YOUR_EMAIL_OR_SEPARATE_EMAIL}
- domain: {GAME_NAME}.surge.sh

I will provide the password myself if Surge asks for it.

After publishing, tell me the final game link.
```

If your agent app asks whether you approve a terminal command, you can answer:

```text
I approve, run it.
```

After publishing, the game will be available at a link like:

```text
https://my-coin-quest.surge.sh
```

### 7.3. If You Already Know the Terminal

You can also publish manually. Open a terminal in the project folder and run:

```bash
npx --yes surge ./src my-game-name.surge.sh
```

Replace `my-game-name` with a short name using Latin letters and no spaces. To update the online game after later changes, run the same command again.

If your terminal says `command not found: npx`, install the **LTS** version of Node.js from `nodejs.org`, then close and reopen the terminal.

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

After you get comfortable and make a few iterations of your game, you may become curious about how everything works. You can read the files inside the project or ask the Agent questions about them. Step by step, this will help you move beyond the basic “ask in chat → receive an answer” workflow.
