const roles = ['admin', 'info', 'support', 'sales']

const roleBasedValidator = (email) => {
  const local = email.split('@')[0].toLowerCase()
  return roles.includes(local)
}

export default roleBasedValidator
