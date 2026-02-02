////////// ////////// ////////// //////////
// Mark Deegan 2026                      //
// Mon Feb  2 22:27:24 GMT 2026          //
////////// ////////// ////////// //////////
// SignalK Route Visibility Manager      //
// Automatically hides inactive routes   //
// when a route is activated             //
////////// ////////// ////////// //////////

module.exports = function (app) {
  const logError = app.error || (err => console.error(err))
  const debug = app.debug || (msg => console.log(msg))

  let plugin = {
    unsubscribes: [],
    routeBackup: new Map() // Store hidden routes for restoration
  }

  plugin.id = 'route-visibility-manager'
  plugin.name = 'Route Visibility Manager'
  plugin.description = 'Automatically hides inactive routes when a route is activated in SignalK'

  plugin.schema = {
    type: 'object',
    required: ['mode'],
    properties: {
      mode: {
        type: 'string',
        title: 'Visibility Mode',
        description: 'How to handle inactive routes',
        default: 'hide',
        enum: ['hide', 'delete', 'keep-backup']
      },
      autoRestore: {
        type: 'boolean',
        title: 'Auto Restore Routes',
        description: 'Restore hidden routes when no route is active',
        default: true
      },
      excludeRoutes: {
        type: 'array',
        title: 'Exclude Routes',
        description: 'Route UUIDs to never hide (comma separated)',
        items: {
          type: 'string'
        },
        default: []
      }
    }
  }

  plugin.start = function (options) {
    debug('Route Visibility Manager starting...')
    
    const mode = options.mode || 'hide'
    const autoRestore = options.autoRestore !== false
    const excludeRoutes = options.excludeRoutes || []

    // Subscribe to active route changes
    const subscription = {
      context: 'vessels.self',
      subscribe: [
        {
          path: 'navigation.courseGreatCircle.activeRoute.href',
          period: 1000
        }
      ]
    }

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
      }
    )

    debug('Route Visibility Manager started')
  }

  plugin.stop = function () {
    debug('Route Visibility Manager stopping...')
    
    // Unsubscribe from all subscriptions
    plugin.unsubscribes.forEach((unsubscribe) => unsubscribe())
    plugin.unsubscribes = []

    // Optionally restore all routes on stop
    restoreAllRoutes()
    
    debug('Route Visibility Manager stopped')
  }

  // Handle active route changes
  function handleActiveRouteChange(activeRouteHref, mode, autoRestore, excludeRoutes) {
    if (!activeRouteHref) {
      // No active route - restore if configured
      if (autoRestore) {
        debug('No active route - restoring hidden routes')
        restoreAllRoutes()
      }
      return
    }

    debug(`Active route changed to: ${activeRouteHref}`)

    // Extract route UUID from href (format: /resources/routes/{uuid})
    const activeRouteId = activeRouteHref.split('/').pop()

    // Get all routes
    const routes = app.getSelfPath('resources.routes')
    
    if (!routes) {
      debug('No routes found in resources')
      return
    }

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
  }

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
  }

  return plugin
}
