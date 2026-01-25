# First Steps in creating a SignalK WebApp
At a very basic level, SignalK can be considered a web-serever to host pages, and applications that you might develop as part of a marine navigation project or ecercise.  
This repo and documentation was put together to help developers to build some of these pages and applications, from scratch, from first-principles, ab-inito (whatever phrase you prefer.  
***This document is still under development, so I beg your pateience if there are still gaps in what a novice needs to get to the 'Hello World' stage on this journey.***  
***I also beg your patience if this example, or parts of this example are overly simple from your own oerspective, or if I make mistakes relating to the purpose and phisophy of SignalK.***    



# Essential Components
Essential files needed to create a SignalK web app are:
1. Frontend: **index.html**  
   This is the initial web page that users will see when they launch your web app from within SignalK. Essentially this is a HTML web page.
3. Backend: **index.js**  
   This is any server-side logic that provdes support to your web page.  
5. Manifest: **package.json**  
   This is a configuration file that tells SignalK how to handle your web app.  


# Directory Structure
One of the first things you will need to do is to set up a directory structure that will contain the minimum set of files to get you started.  
If we choose the name **helloworld** for this application, then a suitable folder structure would be as follows:  

**`     helloworld`**    
`       ├── index.js`  
`       ├── package.json`    
**`       ├── public`**  
**`       │   ├── assets`**    
`       │   │   └── icon.jpg`    
`       │   └── index.html`  
`       └── README.md`  
     
