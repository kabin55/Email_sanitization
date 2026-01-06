const disposableDomains = ['tempmail.com', 'mailinator.com']

const disposableValidator = (email) => {
  const domain = email.split('@')[1]
  return disposableDomains.includes(domain)
}

export default disposableValidator
