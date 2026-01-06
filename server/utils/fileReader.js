import fs from 'fs'

const readEmails = (filePath) => {
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(e => e.trim())
    .filter(Boolean)
}

export default readEmails
