import dns from 'dns/promises'
import { exec } from 'child_process'
import util from 'util'

const execAsync = util.promisify(exec)

const mxValidator = async (email) => {
 try {
    // 1. Extract domain
    const domain = email.split('@')[1]
    if (!domain) throw new Error('Invalid email format')

    //console.log(`Domain extracted: ${domain}`)

    // 2. MX lookup (nslookup -type=mx equivalent)
    const mxRecords = await dns.resolveMx(domain)

    if (!mxRecords || mxRecords.length === 0) {
      //console.log(`No MX records found for ${domain}`)
      return false
    }

    //console.log('MX lookup result:', mxRecords)

    // 3. Choose highest priority MX (lowest number)
    const highestPriorityMX = mxRecords.sort(
      (a, b) => a.priority - b.priority
    )[0]

    const mxHost = highestPriorityMX.exchange
    // console.log(
    //   `Selected highest priority MX: ${mxHost} (priority ${highestPriorityMX.priority})`
    // )

    // 4. Ping MX host once
  
    const pingCommand = `ping -c 1 ${mxHost}`

    //console.log(`Executing ping: ${pingCommand}`)

    const { stdout, stderr } = await execAsync(pingCommand)

    if (stderr) {
      //console.log('Ping stderr:', stderr)
    }

    //console.log('Ping output:\n', stdout)
//console.log(`true`)
    return true
    

  } catch (error) {
    // console.error('Validation failed:', error.message)
    //console.log(`true`)
    return false
  }
}

export default mxValidator
