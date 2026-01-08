const syntaxValidator = (email) => {
  // Basic email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    //console.log(`Invalid email format: ${email}`)
    return false
  }

  const username = email.split('@')[0]

const invalidUsername = 
  !username || // empty
  username.length > 64 ||
  /\s/.test(username) || // whitespace
  username.startsWith('--') ||
  username.startsWith('__') ||
  username.startsWith('.') ||
  username.startsWith('_') ||
  username.endsWith('-') ||
  username.endsWith('.') ||
  username.endsWith('_') ||
  /[\.\-_]{2,}/.test(username) || // consecutive special chars
  /[^a-zA-Z0-9._-]/.test(username) // invalid characters

  if (invalidUsername) {
    //console.log(`Invalid username: ${username} in email ${email}`)
    return false
  }

  // //console.log(`Email syntax and username valid: ${email}`)
  return true
}

export default syntaxValidator
