import dns from 'dns/promises'

// Widely used public email domains
const commonDomains = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com","aol.com","icloud.com",
  "msn.com","live.com","protonmail.com","me.com","mac.com","comcast.net",
  "sbcglobal.net","verizon.net","att.net","yandex.com","mail.ru","gmx.com",
  "zoho.com","qq.com","163.com","yahoo.co.uk","hotmail.co.uk","wanadoo.fr",
  "orange.fr","web.de","gmx.de","libero.it","uol.com.br","bol.com.br"
]

const domainValidator = async (email) => {
  try {
    // Extract domain
    const domain = email?.split('@')[1]?.trim().toLowerCase()
    if (!domain || domain.length > 255) return false

    // First: check if domain is in commonDomains array
    if (commonDomains.includes(domain)) return true

    // Split domain into labels
    const labels = domain.split('.')
    if (labels.some(lbl =>
      !lbl ||                 // empty label
      lbl.length > 63 ||       // label too long
      lbl.startsWith('-') ||
      lbl.endsWith('-') ||
      lbl.includes('..')       // double dot inside label
    )) return false

    // Optional: TLD should be alphabetic or common new TLDs
    const tld = labels[labels.length - 1]
    if (!/^[a-zA-Z]{2,63}$/.test(tld)) return false

    // Handle .edu, .company, .org, .net, etc.
    const allowedTlds = ['com','org','net','edu','gov','int','mil','co','io','tech','company']
    if (!allowedTlds.includes(tld.toLowerCase()) && tld.length < 2) return false

    // Fallback: check if domain exists via DNS A or AAAA records
    try {
      await Promise.any([
        dns.resolve(domain, 'A'),
        dns.resolve(domain, 'AAAA')
      ])
    } catch (err) {
      const validCodes = ['ENOTFOUND', 'ENODATA', 'ENOTIMP']
      if (validCodes.includes(err.code)) return false
      throw err
    }

    return true
  } catch {
    return false
  }
}

export default domainValidator
