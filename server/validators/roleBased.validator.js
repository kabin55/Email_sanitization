const roles = ['admin', 'info', 'support', 'sales','webmaster', 'team','billing','marketing','office','service','customerservice','noreply']

const roleBasedValidator = (email) => {
  const local = email.split('@')[0].toLowerCase()
  return roles.includes(local)
}

export default roleBasedValidator
