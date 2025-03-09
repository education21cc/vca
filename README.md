# VCA warehouse game

To start: `npm run dev`. This will use one of the configs from public/config. This can be changed in `/src/App.tsx`

When building for production, the `PlayerBridge` will wait until `window.GAMEDATA` is set with the content, and then start the game. To that end, the `index.html` listens for messages with a `content` property.

To deploy to github pages, use `npm run deploy`


# Online: https://education21cc.github.io/vca/ 


## What is it?

This game presents a warehouse in an isometric view, the player can zoom in and out, pan and view the entire thing. Then, there are 3 different 'game modes'

-  scenarios
    Where the map shows a few markers. Players click on them to solve the scenario

-  finder
    Where the user is instructed to find X amount of certain items. On completion, player can be taken to another game OR sees the timer endscreen.

-  timedFinder


## Updates:

`2.0.0` mar 2025: Changed CRA for Vite
`0.1.0` aug 2023: First version (using Create React App)