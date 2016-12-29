snowball.io
=============

A simple but powerful snowball.io built with socket.IO and HTML5 canvas on top of NodeJS.

<!--need game screenshot image-->

<!--need deomo-->
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
<!--
## Latest Changes
- Game logic is handled by the server
- The client side is for rendering of the canvas and it's items only.
- Mobile optimisation. 
---
-->

## Installation
<!--
You can simply click one of the buttons below to easily deploy this repo to Bluemix or Heroku:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/huytd/agar.io-clone)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Or...
-->

>You can check out a more detailed setup tutorial on our [wiki](https://github.com/firepunch/snowball/wiki/Setup).

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
<!--
## FAQ
1. **What is this game?**

  This is a clone of the game [Agar.IO](http://agar.io/). Someone said that Agar.IO is a clone of an iPad game called Osmos, but we haven't tried it yet. (Cloneception? :P)
  
2. **Why would you make a clone of this game?**

  Well, while the original game is still online, it is closed-source, and sometimes, it suffers from massive lag. That's why we want to make an open source version of it: for educational purposes, and to let the community add the features that they want, self-host it on their own servers, have fun with friends and more.
  
3. **Any plans on adding an online server to compete with Agar.IO or making money out of it?**

  No. This game belongs to the open-source community, and we have no plans on making money out of it nor competing with anything. But you can of course create your own public server, let us know if you do so and we can add it to our Live Demos list!
  
4. **Can I deploy this game to my own server?**

  Sure you can! That's what it's made for! ;)
  
5. **I don't like HTML5 canvas. Can I write my own game client with this server?**

  Of course! As long as your client supports WebSockets, you can write your game client in any language/technology, even with Unity3D if you want (there is an open source library for Unity to communicate with WebSockets)!
  
6. **Can I use some code of this project on my own?**

  Yes you can.

## For Developers
 - [Game Architecture](https://github.com/huytd/agar.io-clone/wiki/Game-Architecture) to understand how the backend works.
 - If you want to start your own project, I recommend you use [this template](https://github.com/huytd/node-online-game-template). Happy developing!
-->

## TODOs
 We have an explicit [TODO](https://github.com/firepunch/snowball/wiki/Coming-Features) list for the all the features we aim to develop in the future. Feel free to contribute, we'll be more than grateful.

<!--
## License
>You can check out the full license [here](https://github.com/huytd/agar.io-clone/blob/master/LICENSE).

This project is licensed under the terms of the **MIT** license.
-->
