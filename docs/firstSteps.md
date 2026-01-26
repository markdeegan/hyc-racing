# First Steps in creating a SignalK WebApp
At a very basic level, SignalK is a web-serever that hosts pages or web applications that you might develop as part of a marine navigation project or exercise.  
This repo was put together to help developers build a **SignalK** web app, from scratch, from first-principles, ab-inito (whatever phrase you prefer).  
***This document is still under development, so I beg your pateience if there are still gaps in what a novice needs to get to the 'Hello World' stage on this journey.***  
***I also beg your patience if this example, or parts of this example are overly simple from your own oerspective, or if I make mistakes relating to the purpose and phisophy of SignalK. As an engineer and educator, I am nore interested in helping others learn than I am in showing off my skills***    


# Development Environment
1. *SignalK* system   
          To develop *SignalK* web apps and plugins, you will need access to a *SignalK* server. This document does not cover that step, but instructions can be found here: [SignalK Installation](https://demo.signalk.org/documentation/Installation.html)
2. Development platform    
          This could be a laptop, desktop, or even the SignalK system itself.
          If you are using your own SignalK system also for dsevelopment, that makes the installation of webapps, and development of ofther software artefacts easier. However, developing on a different system, and sending files over to the SignalK system is not a particular challenge. I achieve this on my systems using [GitHub](github.com)   
3. *node.js* environment    
             [Node.js and npm setup instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
To test if you have Node.js and npm in stalled on your development system, you can issue the commands:    
`          node -v`    
`          npm -v`    
If you have both Node.js and npm installed on your system, you should see results something similar to the following:    
`  *node -v*`
`  v22.11.0`    
`  *npm -v*`    
`  10.9.0`    
You may get later versions of each of the above. That's fine.


# Directory Structure
One of the first things you will need to do is to set up a directory structure that will contain the minimum set of files to get you started.  
If we choose the name **helloworld** for this application, then a suitable folder structure would be as follows:  

**`     helloworld`**    
**`       └── public`**  
**`           └── assets*`**   

**assets***: Please note that for the absolute minimum projects, even the assets folder is probably not required. 

# Initialise NPM project 
This section assumes that you already have *Node.js* and *npm* installed on your development system.    
You need to initialise a new node project in the home directory (helloworld) for your new project.   
The command to achieve this is *npm init*. This command builds a required file *package.json* that identifies to the node.js system what is contained in your package, or webapp.    
You can write the *package.json* file from scratch, similar to the example below, or you can use the *npm init* command to generate it for you.    
If you choose to run the npm init command, most of the options are suggested for you, but you can accept the default options suggested. Later you may want something a little differnet, but for now, the defaults will do.  
If you chosse to create the package.json file directly, using a text editor, then you will need something approaximating to the package.json file contained in this example repo: [package.json](../package.json)    


     
# Essential Components
Essential files needed to create a SignalK web app are:
1. Frontend: **index.html**  
   This is the initial web page that users will see when they launch your web app from within SignalK. Essentially this is a HTML web page.
3. Backend: **index.js**  
   This is any server-side logic that provdes support to your web page.  
5. Manifest: **package.json**  
   This is a configuration file that tells SignalK how to handle your web app.

`     helloworld`    
**`       ├── index.js`**      
**`       ├── package.json`**        
`       ├── public`  
`           └── assets`    
**`       │   │   └── icon.jpg`**        
**`       │   └── index.html`**      
**`       └── README.md`**      
