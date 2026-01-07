const scoringService = (r) => {
  let score = 100

  if (!r.syntax) score -= 30
  if (!r.domain) score -= 40
  if (!r.mx) score -= 40
  if (r.disposable) score -= 50
  if (r.roleBased) score -= 50

  if (score >= 80) return 'High'
  
  return 'Low'
}

export default scoringService
