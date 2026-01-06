const scoringService = (r) => {
  let score = 100

  if (!r.syntax) score -= 20
  if (!r.domain) score -= 20
  if (!r.mx) score -= 20
  if (r.disposable) score -= 20
  if (r.roleBased) score -= 20

  if (score >= 80) return 'High'
  
  return 'Low'
}

export default scoringService
