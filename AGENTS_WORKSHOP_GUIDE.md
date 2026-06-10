> **Prefer clicking to reading?** Open the [Workshop Console](https://ludenio.github.io/WebGameTemplateForAgents/) — it builds and copies every prompt in this guide for you, and has a checklist that tracks your progress. This guide follows the same steps in the same order.

## 🧭 Workshop Agenda

In this workshop, you will go from a game idea to a playable link you can share with other people.

You will:

1.  Download the game template to your computer.
2.  Install an AI agent app and open the template in it.
3.  Ask the AI Agent to turn your idea into a small browser game.
4.  Play the game on your computer and make changes to it.
5.  Ask the Agent to publish the game online so other people can play it by link.

The main goal is not only to make a game. The goal is to add new tools to your personal "inventory": tools you can later use for many different tasks. For example, you can use an AI agent to automate something you often do by hand, create an autochecker for things that need to be free of mistakes, build a website or app, or simply build something fun.

### Before You Start

You need:

* **A computer** (Windows, macOS, or Linux) where you can install apps.
* **An email address** — used to sign up for the agent app and, later, the publishing service.
* **About 60–90 minutes** for the full path from idea to published link.

You do **not** need: programming experience, a GitHub account, or any knowledge of the terminal. At the end you will have a link to your own game that anyone can open in a browser.

---

## 🎨 Basic Concepts: Developer Dictionary

Before installing anything, let's quickly understand what we are working with:

* **Agent app:** An app where you open the game folder and talk to the AI assistant. Use any agent app that can read and edit files in a local folder. You do not need to read or understand the code yourself.
* **Agent:** The AI assistant inside your agent app. It works like a chat: you write a message, and it answers. The difference is that this Agent can also change files inside the project folder on your computer. You describe what you want in normal language, and the Agent edits the project files for you.
* **Terminal:** An app where commands can be typed. In this guide, you do not need to use it directly. The Agent may use it for you and ask you to approve actions.

Want to *feel* the difference between a plain chat and an agent before starting? Open the **Chat vs agent** tab in the [Workshop Console](https://ludenio.github.io/WebGameTemplateForAgents/) — it is a 3-minute interactive demo.

---

## 📦 Step 1. Download the Project

We will not write the game from scratch. Instead, we will use a starter template that already contains the rules the AI Agent should follow.

1.  Download the template as a ZIP archive: [Download sources](https://github.com/ludenio/WebGameTemplateForAgents/archive/refs/heads/main.zip). (If your workshop host gave you a different download link or QR code, use that one.)
2.  **Extract the ZIP into a folder** on your computer — for example into `Documents`. Do not edit files inside the archive itself: on most systems, files inside a ZIP are read-only copies, and your changes would be lost.

That's it — this folder is your whole project.

## 🤖 Step 2. Install an Agent App

1.  Choose an agent app that can open a local project folder, edit files, and run terminal commands after you approve them. If a workshop host, teacher, or team gave you a specific app, use that one. [Cursor](https://cursor.com) is a good default choice.
2.  Create an account for the app (usually email + verification code).
3.  Download and install the app, then sign in.

## 📂 Step 3. Open the Project Folder in Your Agent App

1.  Open the installed agent app.
2.  Click **Open Folder** and choose the folder you extracted in Step 1. If you do not see this button, use the application menu instead: **File** → **Open Folder**.
3.  Find the chat panel — this is where you will talk to the Agent.

## 🚀 Step 4. Create the Game

Now the magic begins. Your job is to generate ideas; the Agent will do the technical work.

1.  Open the [Workshop Console](https://ludenio.github.io/WebGameTemplateForAgents/) (tab **New game prompt**) **or** the file **`FIRST_PROMPT.md`** in the project folder.
2.  Describe your game idea: how it looks, what the player does, and who the main character is. You can write in simple language. For example: “Top-down view: the character explores a small island, collects coins, helps villagers find lost items, unlocks new areas, and upgrades tools to move faster.” The console has fields and example concepts to click; `FIRST_PROMPT.md` has a quality checklist and a good/weak concept example.
3.  Copy the assembled prompt (the console's **Copy prompt** button copies it for you) and send it to the Agent in the chat.

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

## 🎮 Step 5. How to Play and Make Changes

* **How to run the game:** No servers are needed. Open the game folder on your computer, go into the `src` folder, and double-click **`index.html`**. The game will open in your browser.
* **How to change the game:** Open the [Workshop Console](https://ludenio.github.io/WebGameTemplateForAgents/) (tab **Change prompt**) **or** **`NEXT_ITERATION_PROMPT.md`**, describe what you want to change, copy the prompt, and send it to the Agent in a new chat. For example: “Add coins, a small shop, and three upgrades: faster movement, bigger backpack, and a magnet that pulls nearby coins toward the player.”

To create a new chat, look for a button named **New Chat**, **New Task**, **New Conversation**, or something similar in your agent app. You can think of it like this: many chats can work with the same project folder. The Agent will update the documents and carefully change the code for you.

---

## 🌐 Step 6. Ask the Agent to Publish the Game

When the game already runs on your computer and you want to send a link to a friend, ask the Agent to publish it for you.

This step shows an important idea: an Agent can do more than write text and edit project files. It can also use tools, run terminal commands, check what is installed on your computer, and guide you through missing setup.

For this workshop we will use **Surge**, a service that puts simple websites online. You do not need to open the terminal yourself. Copy the prompt below, answer the Agent's questions, and approve actions when your agent app asks you to.

### 6.1. Before You Ask the Agent

Prepare three things:

* **email** — used to create or log into a Surge account.
* **password** — one rule: **make up a new password just for Surge — never reuse one from another account.** You will type it yourself when Surge asks.
* **domain** — the public site address, for example `my-coin-quest.surge.sh`.

Other players will only see the final public link. These details are not written into the game code.

### 6.2. Copy This Prompt to the Agent

The console's **Publish prompt** tab builds this for you. Or copy it from here, replacing the values in `{curly braces}` with your own:

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

### 6.3. If You Already Know the Terminal

You can also publish manually. Open a terminal in the project folder and run:

```bash
npx --yes surge ./src my-game-name.surge.sh
```

Replace `my-game-name` with a short name using Latin letters and no spaces. To update the online game after later changes, run the same command again.

If your terminal says `command not found: npx`, install the **LTS** version of Node.js from `nodejs.org`, then close and reopen the terminal.

---

## 🩹 Troubleshooting

* **The Agent stopped in the middle of the work.** Just reply `continue` in the same chat. Agents sometimes pause after long steps.
* **The Agent asks a question you don't understand.** Reply: “Explain the options in simple words and recommend one.” Then pick the recommendation.
* **The game page is blank or broken.** Make sure you opened `src/index.html` from your project folder (not a copy somewhere else), and refresh the page. If it is still broken, copy any error message you see and paste it to the Agent with: “The game shows this error, please fix it.”
* **The agent app says you hit a usage limit.** Free plans have limits. Wait a while, or check the app's plan settings. Your project files are safe — nothing is lost.
* **The Agent asks to approve a terminal command.** Read what it wants to do. If it matches what you asked for, approve it. If unsure, ask the Agent: “What does this command do?”
* **You made a change and now the game is worse.** Tell the Agent: “Undo the last change and restore the previous version.” (If you set up GitHub later — see Level 2 — you also get a full safety history.)

---

## 🏁 Workshop Recap

During this workshop, you downloaded a project, asked an AI Agent to work with files on your computer, tested the result in a browser, changed the project through another prompt, and published it online as a shareable link.

The most important takeaway is this: you now have a new set of tools in your personal inventory.

You can use the same approach later to:

* automate tasks you often repeat by hand;
* check files, text, data, or project rules where mistakes often happen;
* create a simple game, website, app, prototype, or personal tool;
* experiment, learn, and have fun making things faster than before.

Nothing about this workflow is game-specific. For example, try opening any empty folder in your agent app and sending:

```text
Look at the folder of my vacation photos at {PATH_TO_FOLDER}. Write a small script
that sorts them into subfolders by year and month taken, show me the plan first,
and run it only after I approve.
```

You do not need to become a professional programmer overnight. Just start building by asking your agent. The more you practice, the better you will understand what an AI Agent can do for you.

## 🔭 What Next?

After you get comfortable and make a few iterations of your game, you may become curious about how everything works. You can read the files inside the project or ask the Agent questions about them. Step by step, this will help you move beyond the basic “ask in chat → receive an answer” workflow.

---

## 🗄 Level 2 (Optional): Keep Your Project Safe with GitHub

The ZIP you downloaded lives only on your computer. If you want a full "save history" for your project — so any broken change can be rolled back, and your game's source can be shared — set up Git and GitHub. This is optional and can be done at any time, even after the workshop.

Three more dictionary entries:

* **Git:** A “save history” system for a whole folder. If the AI changes something and the game breaks, Git can take you back to an earlier working version.
* **GitHub:** A cloud service for storing projects. Think of it like Google Drive or Dropbox, but made especially for code and project files.
* **GitHub Desktop:** A friendly app with buttons for GitHub. It lets you save and upload changes without typing Git commands.

Setup:

1.  **Create a GitHub account.** Go to **github.com**, click **Sign up**, enter your email, create a strong password, choose a username, and confirm the code sent to your email.
2.  **Install GitHub Desktop.** Go to **desktop.github.com**, download and install it, then click **Sign in to GitHub.com** and authorize it in the browser window that opens.
3.  **Put your project on GitHub.** In GitHub Desktop choose **File** → **Add local repository** and select your game folder. GitHub Desktop will offer to create a repository — accept, then click **Publish repository**. On GitHub, a “repository” simply means a project folder stored online.
4.  **Save your progress regularly.** After each good change, open GitHub Desktop, write a short summary (e.g. “added shop and upgrades”), click **Commit**, then **Push origin**. Each commit is a save point you can return to.

Tip: you can also ask your Agent to do all of this for you — for example: “Set up Git in this project and help me publish it to my GitHub account as a private repository.”
