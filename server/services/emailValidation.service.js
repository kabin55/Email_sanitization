import syntax from '../validators/syntax.validator.js'
import domain from '../validators/domain.validator.js'
import mx from '../validators/mx.validator.js'
import disposable from '../validators/disposable.validator.js'
import role from '../validators/roleBased.validator.js'
import score from './scoring.service.js'

const validateEmailService = async (email) => {
  const results = {
    syntax: syntax(email),
    domain: await domain(email),
    mx: await mx(email),
    disposable: disposable(email),
    roleBased: role(email),
  }

  const confidence = score(results)

  return { email, results, confidence }
}

export default validateEmailService
