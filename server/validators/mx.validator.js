import dns from 'dns/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Function to extract domain from email
const getDomainFromEmail = (email) => {
  const parts = email.split('@');
  if (parts.length !== 2) throw new Error('Invalid email');
  return parts[1];
};

// Function to run nslookup for MX records
const getMxRecords = (domain) => {
  return new Promise((resolve, reject) => {
    exec(`nslookup -type=mx ${domain}`, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stderr);

      const lines = stdout.split('\n');
      const mxRecords = [];

      for (const line of lines) {
        // Example line: "gmail.com       mail exchanger = 5 gmail-smtp-in.l.google.com."
        const match = line.match(/mail exchanger = (\d+) (.+)/);
        if (match) {
          mxRecords.push({ priority: parseInt(match[1]), host: match[2].replace(/\.$/, '') });
        }
      }

      if (mxRecords.length === 0) return reject('No MX records found');
      resolve(mxRecords);
    });
  });
};

// Function to ping the MX server with lowest priority
const pingMxServer = (host) => {
  return new Promise((resolve, reject) => {
    // Use '-n 1' for Windows, '-c 1' for Linux/macOS
    const pingCmd = process.platform === 'win32' ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;
    exec(pingCmd, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};




const mxValidator = async (email) => {
try {
    const domain = getDomainFromEmail(email);
    console.log(`Domain extracted: ${domain}`);

    const mxRecords = await getMxRecords(domain);
    console.log('MX Records:', mxRecords);

    // Find MX with lowest priority
    const lowestPriorityMx = mxRecords.sort((a, b) => a.priority - b.priority)[0];
    console.log(`Pinging MX server: ${lowestPriorityMx.host} (priority ${lowestPriorityMx.priority})`);

    const pingResult = await pingMxServer(lowestPriorityMx.host);
    console.log(pingResult);
    return true;
  } catch (err) {
    return false;
  }
}

export default mxValidator
