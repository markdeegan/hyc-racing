# Hello World - SignalK WebApp

A bare-bones SignalK web application for developers. This is the absolute minimum needed to create a SignalK webapp, intended as a starting point for developers wishing to build SignalK webapps from first principles.

## What is this?

This is a minimal example of a SignalK webapp that demonstrates:
- The required file structure (`package.json` with `signalk-webapp` keyword and `public/` directory)
- How to connect to a SignalK server via WebSocket
- How to receive and display SignalK delta messages

## Installation

To install this webapp in your SignalK server:

1. **Via npm** (if published):
   ```bash
   npm install @signalk/helloworld
   ```

2. **Via local file**:
   ```bash
   cd /path/to/signalk-server-data-directory/node_modules
   git clone https://github.com/markdeegan/helloworld.git
   ```

3. Restart your SignalK server

4. Navigate to "WebApps" in your SignalK admin interface and launch "Hello World"

## File Structure

```
helloworld/
├── package.json          # NPM package file with SignalK metadata
├── public/
│   └── index.html        # The webapp HTML file
└── README.md
```

## Key Components

### package.json
- Must include `"signalk-webapp"` in the keywords array
- Contains `signalk` section with `displayName` and optional metadata

### public/index.html
- Contains the webapp UI
- Connects to SignalK server WebSocket at `/signalk/v1/stream`
- Displays incoming delta messages

## For Developers

This is intentionally minimal. You can extend it by:
- Adding more UI components
- Processing specific SignalK data paths
- Implementing vessel controls
- Adding charts and visualizations
- Styling with frameworks like Bootstrap or Material UI
- Using frameworks like React, Vue, or Angular

## SignalK WebSocket API

The webapp connects to: `ws://[hostname]:[port]/signalk/v1/stream`

This returns delta messages in the format:
```json
{
  "context": "vessels.urn:mrn:signalk:uuid:...",
  "updates": [
    {
      "source": {...},
      "timestamp": "2024-01-01T12:00:00.000Z",
      "values": [
        {
          "path": "navigation.position",
          "value": {"latitude": 60.0, "longitude": 24.0}
        }
      ]
    }
  ]
}
```

## Resources

- [SignalK Documentation](https://signalk.org/)
- [SignalK WebApps Guide](https://demo.signalk.org/documentation/Developing/Plugins/WebApps.html)
- [SignalK Specification](https://signalk.org/specification/latest/)

## License

Apache-2.0
