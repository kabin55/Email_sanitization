import validateEmail from './emailValidation.service.js'

const batchValidate = async (emails) => {
  const validEmails = []
  const invalidEmails = []

  for (const email of emails) {
    const result = await validateEmail(email)

    if (result.confidence === 'High') {
      validEmails.push(result)
    } else {
      invalidEmails.push(result)
    }
  }

  return { validEmails, invalidEmails }
}

export default batchValidate
