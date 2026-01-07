import dns from 'dns/promises'

const domainValidator = async (email) => {
 try {
    const domain = email?.split('@')[1]?.trim()
    if (!domain || domain.length > 255) return false

    // Split domain into labels and validate each
    const labels = domain.split('.')
    if (labels.some(lbl => 
      !lbl ||             // empty label
      lbl.length > 63 ||  // label too long
      lbl.startsWith('-') ||
      lbl.endsWith('-') ||
      lbl.includes('..')  // double dot inside label
    )) return false

    // Optional: check TLD is alphabetic
    const tld = labels[labels.length - 1]
    if (!/^[a-zA-Z]{2,63}$/.test(tld)) return false
console.log(tld)
    // Check if domain exists via DNS A or AAAA records
    await Promise.any([
      dns.resolve(domain, 'A'),
      dns.resolve(domain, 'AAAA')
    ]).catch(err => {
      // Treat known DNS errors as invalid domain
      const validCodes = ['ENOTFOUND', 'ENODATA', 'ENOTIMP']
      if (validCodes.includes(err.code)) return false
      throw err
    })

    return true
  } catch {
    return false
  }
}

export default domainValidator;
