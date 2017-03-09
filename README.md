snowball.io
=============

A simple but powerful snowball.io built with socket.IO and HTML5 canvas on top of NodeJS.
![Intro Page](/readMeImages/introPage.gif)
![Ateam Character NaYeon from twice](/readMeImages/snowballPlay.gif)
![Ateam Character NaYeon from twice](/readMeImages/main.png)

---

## How to Play
You can check out how to play on our [wiki](https://github.com/firepunch/snowball/wiki/How-to-Play).

#### Game Basics
- Press w,a,s,d on the keyboard to move character.
- Attack other players in order to grow your character (food respawns every time a player eats it).
- A player's **Experience point** is the number of attack other players and souls eaten.
- **Objective**: Try to get as higher as possible and attack the other team's snowman at the end ot the wall.

#### Gameplay Rules
- Attack the enemy snowman, the score reduced.
- Attack the own snowman, the score increased.
- Everytime a player joins the game, team is **random**.
<!-- need speed, throw power, max ball count, ball demage, ball hp, jump demage explanation. -->

---


## Installation
You can check out a more detailed setup tutorial on our [wiki](https://github.com/firepunch/snowball/wiki/Setup).

#### Requirements
To run / install this game, you'll need:
- Redis
- NodeJS with NPM installed.
- socket.IO.
- Express.


#### Downloading the dependencies
After cloning the source code from Github, you need to run the following command to download all the dependencies (socket.IO, express, etc.):

```
npm install
```

#### Running the Redis
After downloading all the dependencies, you should run Redis Server before run main Server.:
```
snowball\redis-2.4.5-win32-win64\64bit\redis-server.exe
```
or
```
snowball\redis-2.4.5-win32-win64\32bit\redis-server.exe
```

#### Running the Server
After downloading all the dependencies, you can run the server with the following command:

```
npm start
```

The game will then be accessible at `http://localhost:3002` or the respective server installed on. The default port is `3002`, however this can be changed in config.

---
#### Images
Ateam Character NaYeon from twice ![Ateam Character NaYeon from twice](/readMeImages/NY1.png)
Bteam Character MoMo from twice ![Bteam Character MoMo from twice](/readMeImages/MM1.png)


## TODOs
 We have an explicit [TODO](https://github.com/firepunch/snowball/wiki/Coming-Features) list for the all the features we aim to develop in the future. Feel free to contribute, we'll be more than grateful.
