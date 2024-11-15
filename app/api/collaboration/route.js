import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import { headers } from 'next/headers'

const wss = new WebSocketServer({ noServer: true })

wss.on('connection', setupWSConnection)

export function GET(request) {
  const headersList = headers()
  const upgrade = headersList.get('upgrade')
  
  if (upgrade?.toLowerCase() !== 'websocket') {
    return new Response('Expected Websocket', { status: 426 })
  }

  // @ts-ignore
  const socket = request.socket
  
  wss.handleUpgrade(request, socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, request)
  })

  return new Response(null)
}

export const dynamic = 'force-dynamic' 