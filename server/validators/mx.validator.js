import dns from 'dns/promises'

const mxValidator = async (email) => {
  try {
    const domain = email.split('@')[1]
    const records = await dns.resolveMx(domain)
    return records.length > 0
  } catch {
    return false
  }
}

export default mxValidator
