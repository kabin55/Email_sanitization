import syntax from '../validators/syntax.validator.js'
import domain from '../validators/domain.validator.js'
import mx from '../validators/mx.validator.js'
import disposable from '../validators/disposable.validator.js'
import role from '../validators/roleBased.validator.js'
import score from './scoring.service.js'
import {bulkSmtpCheck} from '../validators/smtp.validatior.js'

const validateEmailService = async (email) => {
  console.log('Validating email:', email)
  const smtpResultArray = await bulkSmtpCheck([email], 2, 1500)
  const smtpResult = smtpResultArray[0]
  console.log('SMTP result:', smtpResult)
  const results = {
    syntax: syntax(email),
    domain: await domain(email),
    mx: await mx(email),
    disposable: disposable(email),
    roleBased: role(email),
    smtp: smtpResult
  }
  console.log('Validation results:', results)

  const confidence = score(results)

  return { email, results, confidence }
}

export default validateEmailService
