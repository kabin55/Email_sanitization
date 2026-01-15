import dns from 'dns/promises'
import net from 'net'

/* =========================
   SKIP SMTP FOR LARGE PROVIDERS
========================= */
const skipSmtpDomains = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'ymail.com', 'rocketmail.com', 'aol.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com',
  'zoho.com', 'zohomail.com'
]

/* =========================
   GET MX SERVER
========================= */
async function getMX(domain) {
  try {
    const records = await dns.resolveMx(domain)
    records.sort((a, b) => a.priority - b.priority)
    return records[0].exchange
  } catch {
    return null
  }
}

/* =========================
   SMTP COMMAND HELPER WITH TIMEOUT
========================= */
function smtpCommand(socket, command, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    const timer = setTimeout(() => {
      socket.removeAllListeners('data')
      socket.removeAllListeners('error')
      reject(new Error('SMTP command timeout'))
    }, timeoutMs)

    const onData = (data) => {
      buffer += data.toString()
      if (/\r?\n$/.test(buffer)) {
        clearTimeout(timer)
        socket.removeListener('data', onData)
        socket.removeListener('error', onError)
        resolve(buffer.trim())
      }
    }

    const onError = (err) => {
      clearTimeout(timer)
      socket.removeListener('data', onData)
      socket.removeListener('error', onError)
      reject(err)
    }

    socket.on('data', onData)
    socket.on('error', onError)

    if (command) socket.write(command + '\r\n')
  })
}

/* =========================
   SINGLE EMAIL SMTP CHECK
   Returns true/false
========================= */
async function checkSmtpTiming(email) {
  const domain = email.split('@')[1].toLowerCase()

  // skip big providers → treat as valid
  if (skipSmtpDomains.includes(domain)) return true

  const mxServer = (await getMX(domain)) || `mail.${domain}`

  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxServer)
    socket.setTimeout(8000)

    const fail = () => {
      socket.destroy()
      resolve(false)
    }

    socket.on('timeout', fail)
    socket.on('error', fail)

    socket.once('connect', async () => {
      try {
        await smtpCommand(socket) // banner
        await smtpCommand(socket, 'HELO example.com')
        await smtpCommand(socket, 'MAIL FROM:<test@example.com>')

        const start = Date.now()
        const rcpt = await smtpCommand(socket, `RCPT TO:<${email}>`)
        const end = Date.now()
        socket.end()

        const smtpCode = parseInt(rcpt.slice(0, 3))
        const responseTimeMs = end - start

        resolve(smtpCode === 250 && responseTimeMs > 400)
      } catch {
        fail()
      }
    })
  })
}

/* =========================
   BULK QUEUE + RATE LIMITER
   Returns array of true/false
========================= */
export async function bulkSmtpCheck(emails, concurrency = 3, delayMs = 1000) {
  const results = []
  let index = 0

  async function worker() {
    while (index < emails.length) {
      const i = index++
      try {
        results[i] = await checkSmtpTiming(emails[i])
      } catch {
        results[i] = false
      }
      await new Promise(r => setTimeout(r, delayMs))
    }
  }

  const workers = Array(concurrency).fill(null).map(() => worker())
  await Promise.all(workers)

  return results
}
