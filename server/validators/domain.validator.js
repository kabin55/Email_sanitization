import dns from 'dns/promises'

const domainValidator = async (email) => {
  try {
    const domain = email.split('@')[1]
    await dns.resolve(domain)
    return true
  } catch {
    return false
  }
}

export default domainValidator
