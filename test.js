import dns from 'dns/promises'
import net from 'net'

async function getMX(domain) {
  try {
    const records = await dns.resolveMx(domain)
    records.sort((a, b) => a.priority - b.priority)
    return records[0].exchange
  } catch {
    return null
  }
}

function smtpCommand(socket, command) {
  return new Promise((resolve, reject) => {
    socket.once('data', data => resolve(data.toString()))
    socket.once('error', reject)
    if (command) socket.write(command + '\r\n')
  })
}

/**
 * Returns result ONLY if smtp_code === 250
 * AND response_time_ms > 400
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function checkSmtpTiming(email) {
  const domain = email.split('@')[1]
  const mxServer = (await getMX(domain)) || `mail.${domain}`

  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxServer)
    socket.setTimeout(10000)

    const fail = (error) =>
      resolve(null) // silently ignore non-matching cases

    socket.on('timeout', () => {
      socket.destroy()
      fail('timeout')
    })

    socket.on('error', () => {
      fail('connection error')
    })

    socket.on('connect', async () => {
      try {
        await smtpCommand(socket) // banner
        await smtpCommand(socket, 'HELO example.com')
        await smtpCommand(socket, 'MAIL FROM:<test@example.com>')

        const start = Date.now()
        const rcptResponse = await smtpCommand(
          socket,
          `RCPT TO:<${email}>`
        )
        const end = Date.now()

        socket.end()

        const smtpCode = parseInt(rcptResponse.slice(0, 3))
        console.log('SMTP Response Time (ms):', end - start)
        const responseTimeMs = end - start

        // FILTER CONDITION
        if (smtpCode === 250 && responseTimeMs > 400) {
          resolve({
            email,
            smtp_code: smtpCode,
            response_time_ms: responseTimeMs,
            risk_score: 50,
            raw_response: rcptResponse.trim()
          })
        } else {
          resolve(null)
        }
      } catch {
        resolve(null)
      }
    })
  })
}

const emails = [
  'kaka1@gmail.com',
  'new@digosolution.com',
  'sushan22013217@iimscollege.edu.np',
  'aryaladitya867@gmail.com',
  'xyza72004@gmail.com',
  'card@nepalbank.com.np',
  'info@nepalbank.com.np',
  'payment@nepalbank.com.np'
]

for (const email of emails) {
  const result = await checkSmtpTiming(email)
  console.log(result)
}