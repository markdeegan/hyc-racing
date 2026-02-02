////////// ////////// ////////// //////////
// Mark Deegan 2026                      //
// Mon Feb  2 22:27:24 GMT 2026          //
////////// ////////// ////////// //////////
// SignalK Route Visibility Manager      //
// Automatically hides inactive routes   //
// when a route is activated             //
////////// ////////// ////////// //////////

module.exports = function (app) {
  // Utility logging functions
  // We use app.error and app.debug if available
  // otherwise fallback to console
  const logError = app.error || (err => console.error(err))
  const debug = app.debug || (msg => console.log(msg))

  // define the plugin object
  let plugin = {
    // unsubscribe functions for cleanup
    unsubscribes: [],
    // backup of hidden routes
    // I'm not sure I like this, but it's necessary for restoration
    // of other routes when no route is active
    routeBackup: new Map() // Store hidden routes for restoration
  }
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // define plugin metadata, id, name, description, schema
  plugin.id = 'route-visibility-manager'
  plugin.name = 'Route Visibility Manager'
  plugin.description = 'Automatically hides inactive routes when a route is activated in SignalK'
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // define the configuration schema
  plugin.schema = {
    type: 'object',
    required: ['mode'],
    properties: {
      ///////// ////////// ////////// //////////
      // mode: hide, delete, keep-backup for hidden routes
      mode: {
        type: 'string',
        title: 'Visibility Mode',
        description: 'How to handle inactive routes',
        default: 'hide',
        enum: ['hide', 'delete', 'keep-backup']
      },
      // end of mode
      ///////// ////////// ////////// //////////

      ///////// ////////// ////////// //////////
      // autoRestore: true/false
      autoRestore: {
        type: 'boolean',
        title: 'Auto Restore Routes',
        description: 'Restore hidden routes when no route is active',
        default: true
      },
      // end of autoRestore
      ///////// ////////// ////////// //////////

      ///////// ////////// ////////// //////////
      // excludeRoutes: array of route UUIDs to never hide
      excludeRoutes: {
        type: 'array',
        title: 'Exclude Routes',
        description: 'Route UUIDs to never hide (comma separated)',
        items: {
          type: 'string'
        },
        default: []
      } // end of excludeRoutes
      ///////// ////////// ////////// //////////
    } // end of properties
  } // end of schema
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // start the plugin
  plugin.start = function (options) {
    // Log starting message
    debug('Route Visibility Manager starting...')
    
    // merge options with defaults
    const mode = options.mode || 'hide'
    const autoRestore = options.autoRestore !== false
    const excludeRoutes = options.excludeRoutes || []
    ////////// ////////// ////////// //////////  

    ////////// ////////// ////////// //////////  
    // Subscribe to active route changes
    // every second
    const subscription = {
      context: 'vessels.self',
      subscribe: [
        {
          path: 'navigation.courseGreatCircle.activeRoute.href',
          period: 1000
        } 
        // end of subscribe array item
      ] // end of subscribe array
    } // end of subscription object
    ////////// ////////// ////////// //////////

    ////////// ////////// ////////// //////////
    app.subscriptionmanager.subscribe(
      subscription,
      plugin.unsubscribes,
      (subscriptionError) => {
        logError('Error subscribing to active route: ' + subscriptionError)
      },
      (delta) => {
        delta.updates.forEach((update) => {
          update.values.forEach((value) => {
            if (value.path === 'navigation.courseGreatCircle.activeRoute.href') {
              handleActiveRouteChange(value.value, mode, autoRestore, excludeRoutes)
            }
          })
        })
      } // end of delta callback
    ) // end of subscribe call
    ////////// ////////// ////////// //////////

    debug('Route Visibility Manager started')
  } // end of start function
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // stop the plugin
  plugin.stop = function () {
    // Log stopping message
    debug('Route Visibility Manager stopping...')
    
    // Unsubscribe from all subscriptions
    plugin.unsubscribes.forEach((unsubscribe) => unsubscribe())
    plugin.unsubscribes = []

    // Optionally restore all routes on stop
    restoreAllRoutes()
    
    // Log stopped message
    debug('Route Visibility Manager stopped')
  }
  // end of stop function
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // Handle active route changes
  function handleActiveRouteChange(activeRouteHref, mode, autoRestore, excludeRoutes) {
    if (!activeRouteHref) {
      // No active route - restore if configured
      if (autoRestore) {
        debug('No active route - restoring hidden routes')
        restoreAllRoutes()
      }
      return
    } // end of no active route
    // Active route present - hide other routes
    ///////// ////////// ////////// //////////

    debug(`Active route changed to: ${activeRouteHref}`)

    // Extract route UUID from href (format: /resources/routes/{uuid})
    const activeRouteId = activeRouteHref.split('/').pop()

    // Get all routes
    const routes = app.getSelfPath('resources.routes')
    
    // No routes found
    if (!routes) {
      debug('No routes found in resources')
      return
    } // end of no routes found


    // Process each route
    Object.keys(routes).forEach((routeId) => {
      // Skip the active route and excluded routes
      if (routeId === activeRouteId || excludeRoutes.includes(routeId)) {
        return
      }

      const route = routes[routeId]
      
      // Backup the route before hiding
      if (!plugin.routeBackup.has(routeId)) {
        plugin.routeBackup.set(routeId, JSON.parse(JSON.stringify(route)))
        debug(`Backed up route: ${route.name || routeId}`)
      }

      // Hide or delete based on mode
      if (mode === 'delete' || mode === 'hide') {
        deleteRoute(routeId)
      }
    })
  }

  // Delete a route from resources
  // again, not fond of this, but necessary
  function deleteRoute(routeId) {
    const delta = {
      updates: [
        {
          values: [
            {
              path: `resources.routes.${routeId}`,
              value: null
            }
          ]
        }
      ]
    }

    app.handleMessage(plugin.id, delta)
    debug(`Deleted route: ${routeId}`)
  } //
  // end of deleteRoute function
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // Restore all backed-up routes
  function restoreAllRoutes() {
    if (plugin.routeBackup.size === 0) {
      return
    }

    debug(`Restoring ${plugin.routeBackup.size} routes`)

    plugin.routeBackup.forEach((route, routeId) => {
      const delta = {
        updates: [
          {
            values: [
              {
                path: `resources.routes.${routeId}`,
                value: route
              }
            ]
          }
        ]
      }

      app.handleMessage(plugin.id, delta)
      debug(`Restored route: ${route.name || routeId}`)
    })

    // Clear backup
    plugin.routeBackup.clear()
  } // end of restoreAllRoutes function
  ////////// ////////// ////////// //////////

  // end of plugin definition
  // return the plugin object
   return plugin
} // end of module.exports function
///////// ////////// ////////// //////////