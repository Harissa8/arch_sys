import { createServer, Server } from 'http'
import { requestHandler } from './server'

/**
 * createApp - returns an http.Server that uses the project's requestHandler.
 * This is used by tests which call createApp() and use supertest against it.
 */
export function createApp(): Server {
  return createServer(requestHandler)
}

// Optional default: when run directly, start the server (keeps previous behavior in server.ts)
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000
  const srv = createApp()
  srv.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`)
  })
}

export default createApp
import { helloWorld } from './hello-world';

const greet = helloWorld();
console.log(greet);
