import validateEmailService from '../services/emailValidation.service.js'

export const validateEmail = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }

  const result = await validateEmailService(email)
  res.json(result)
}

export const validateEmailFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const fileBuffer = req.file.buffer
  const fileContent = fileBuffer.toString('utf-8')

  // Split file into emails and remove empty lines
  const emails = fileContent.split(/\r?\n/).map(e => e.trim()).filter(Boolean)

  const validEmails = []
  const invalidEmails = []

  for (const email of emails) {
    const result = await validateEmailService(email) // validate each email
    if (result.confidence === 'High') validEmails.push(result)
    else invalidEmails.push(result)
  }

  // Use the arrays you collected
  res.json({
    total: emails.length,
    validCount: validEmails.length,
    invalidCount: invalidEmails.length,
    validEmails,
    invalidEmails
  })
}

