////////// ////////// ////////// //////////
// ToughNut SignalK Plugin               //
// Mark Deegan 2026                      //
// Tue Jan 27 12:40:53 GMT 2026          //
////////// ////////// ////////// //////////
// SignalK ToughNut Plugin Template      //
// A basic SignalK plugin template to    //
// get you started.                      // 
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// define the plugin object to be       //
// returned to the calling function     //
// It provides various methods and      //
// properties that define the plugin's  //
// behavior and configuration.         //
////////// ////////// ////////// //////////
module.exports = function (app) {
  // define the logError function 
  const logError =
    app.error ||
    (err => {
      console.error(err)
    })

  // define the debug function
  const debug =
    app.debug ||
    (msg => {
      console.log(msg)
    })

  // define the plugin object
  // it only has one property 'unsubscribes' which
  // is an array to hold unsubscribe functions
  // initially empty
  var plugin = {
    unsubscribes: []
  }

  // define various properties of the plugin
  // such as id, name, description, and schema
  plugin.id = 'helloworld'
  // name
  plugin.name = 'ToughNut Plugin'
  // description
  plugin.description =
    'Plugin that demonstrates that I can create a basic SignalK pluginconfig panel.'

  // and schema
  plugin.schema = () => ({
    // schema definition
    // title, type, properties
    title: 'helloworld',
    // type
    type: 'object',
    // and properties of the schema
    properties: {
      // these are the individual data fields that the 
      // plugin will use for configuration

      ////////// ////////// ////////// ////////// 
      // we have an 'interval' property of type number
      interval: {
        type: 'number',
        title: 'WooHoo!! I have the start of a plugin.',
        default: 0
      },
      // end definition of interval property
      ////////// ////////// ////////// ////////// 

      ////////// ////////// ////////// ////////// 
      // a 'port' property of type boolean
      port: {
        type: 'boolean',
        title: 'Have a glass of wine to celebrate?',
        default: true
      },
      // end definition of port property
      ////////// ////////// ////////// //////////

      ////////// ////////// ////////// //////////
      // a 'steakSandwich' property of type boolean
      steakSandwich: {
        type: 'boolean',
        title: 'Have a steak sandwich to celebrate?',
        default: false
      },
      // end definition of steakSandwich property
      ////////// ////////// ////////// //////////

      ////////// ////////// ////////// //////////
      // and a 'preferNetworkTime' property of type boolean
      // these will need to be changed before I share this plugin
      // with the world
      preferNetworkTime: {
        type: 'boolean',
        title: 'Set system time only if no other source is available (only chrony detected)',
        default: true
      } // end definition of preferNetworkTime property
      ////////// ////////// ////////// //////////
    } // end of definition of properties
    //////////  //////////  //////////  //////////  
  }) // end of definition of schema
  //////////  //////////  //////////  //////////  

  //////////  //////////  //////////  //////////  
  // define the count variable to keep track of
  // how many times the system time has been set
  // this is a legacy of the original plugin
  // on which this is based and may be removed in future versions
  let count = 0

  //////////  //////////  //////////  //////////  
  // define the lastMessage variable to hold
  // the last status message
  let lastMessage = ''

  //////////  //////////  //////////  //////////  
  // define the statusMessage function
  plugin.statusMessage = function () {
    return `${lastMessage} ${count > 0 ? '- system time set ' + count + ' times' : ''}`
  }

  //////////  //////////  //////////  //////////  
  // define the start function
  // a SignalK plugin must have a start function
  // there is quite a bit going on here that relates
  // to setting the system time on a linux-like OS
  // using sudo if necessary and the date command
  plugin.start = function (options) {
    let stream = app.streambundle.getSelfStream('navigation.datetime')
    if (options && options.interval > 0) {
      stream = stream.debounceImmediate(options.interval * 1000)
    } else {
      stream = stream.take(1)
    }
    plugin.unsubscribes.push(
      stream.onValue(function (datetime) {
        var child
        if (process.platform == 'win32') {
          console.error("Set-system-time supports only linux-like os's")
        } 
        else 
        {
          if( ! plugin.useNetworkTime(options) ){
            // Validate datetime format to prevent command injection
            if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(datetime)) {
              lastMessage = 'Invalid datetime format received: ' + String(datetime).substring(0, 50)
              logError(lastMessage)
              return
            }
            const useSudoFallback = typeof options.sudo === 'undefined' || options.sudo
            // Convert ISO 8601 datetime to format compatible with both GNU date and BusyBox date
            // e.g., "2024-01-10T17:55:03.000Z" → "2024-01-10 17:55:03"
            const dateStr = datetime.replace('T', ' ').replace(/\.\d+Z?$|Z$/, '')
            const setDate = `date -u -s "${dateStr}"`

            // First try without sudo (works in Docker with setuid bit on /usr/bin/date)
            // this is useful in exploring the use of child processes on the host OS
            child = require('child_process').spawn('sh', ['-c', setDate])
            child.on('exit', value => {
              if (value === 0) {
                count++
                lastMessage = 'System time set to ' + datetime
                debug(lastMessage)
              } else if (useSudoFallback) {
                // Try with sudo as fallback
                const sudoCommand = `if sudo -n date &> /dev/null ; then sudo ${setDate} ; else exit 3 ; fi`
                const sudoChild = require('child_process').spawn('sh', ['-c', sudoCommand])
                sudoChild.on('exit', sudoValue => {
                  if (sudoValue === 0)
                  { // Succeeded with sudo
                    count++
                    lastMessage = 'System time set to ' + datetime + ' (using sudo)'
                    debug(lastMessage)
                  } // end of if for sudoValue 0
                  else if (sudoValue === 3) 
                  { // Passwordless sudo not available
                    lastMessage =
                      'Setting time failed. Passwordless sudo not available. Configure sudoers or use Docker image with setuid bit on /usr/bin/date'
                    logError(lastMessage)
                  } // end of if for sudoValue 3
                }) 
                sudoChild.stderr.on('data', function (data) {
                  lastMessage = data.toString()
                  logError(lastMessage)
                }) //
              } // end of if for sudo fallback 
              else 
              {
                lastMessage =
                  'Setting time failed. Enable sudo fallback or use Docker image with setuid bit on /usr/bin/date'
                logError(lastMessage)
              } // end of if for sudo fallback
            }) // end of child.on exit
            child.stderr.on('data', function (data) {
              // Suppress stderr from first attempt if sudo fallback is enabled
              if (!useSudoFallback) {
                lastMessage = data.toString()
                logError(lastMessage)
              } // end of if for useSudoFallback
            })// end of child.stderr.on
          } // end of if for useNetworkTime
        } // end of else for non-windows os
      }) // end of onValue function
    ) // end of push to unsubscribes
  } // end of start function
  //////////  //////////  //////////  //////////

  //////////  //////////  //////////  //////////  
  // define the useNetworkTime function
  // While this is particular to this plugin it is
  // a legacy of the original plugin on which this is based
  // and may be removed in future versions
  plugin.useNetworkTime = (options) => {
    if ( typeof options.preferNetworkTime !== 'undefined' && options.preferNetworkTime == true ){
      const chronyCmd = "chronyc sources 2> /dev/null | cut -c2 | grep -ce '-\|*'";
      try {
        validSources = require('child_process').execSync(chronyCmd,{timeout:500});
      } catch (e) {
        return false
      }
      if(validSources > 0 ){
        return true
      }
    }
    return false
  } // end
  //////////  //////////  //////////  //////////  

  //////////  //////////  //////////  //////////  
  // define the stop function
  // a SignalK plugin must have a stop function
  plugin.stop = function () {
    plugin.unsubscribes.forEach(f => f())
  } // end of stop function
  //////////  //////////  //////////  //////////

  //////////  //////////  //////////  //////////
  // return the plugin object
  // this makes the plugin available to
  // the SignalK server
  return plugin
} // end of module.exports function
//////////  //////////  //////////  //////////