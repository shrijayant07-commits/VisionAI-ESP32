export function parseIP(input) {
  if (!input) return ''
  let clean = input.trim()
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      clean = new URL(clean).hostname
    } catch {
      clean = clean.replace(/^https?:\/\//, '').split(':')[0].split('/')[0]
    }
  }
  return clean
}

export function validateIP(input) {
  const ip = parseIP(input)
  if (!ip) return 'Please enter an IP address (e.g. 192.168.1.100)'
  const parts = ip.split('.')
  if (parts.length !== 4) return 'IP must have 4 parts separated by dots'
  for (const part of parts) {
    const n = Number(part)
    if (part === '' || isNaN(n) || !Number.isInteger(n) || n < 0 || n > 255) {
      return 'Each part must be a number between 0 and 255'
    }
  }
  return null
}

export function buildStreamUrl(input, port = 81, path = '/stream') {
  const error = validateIP(input)
  if (error) return null
  const ip = parseIP(input)
  return `http://${ip}:${port}${path}`
}

export function buildSnapshotUrl(input, port = 80, path = '/capture') {
  const error = validateIP(input)
  if (error) return null
  const ip = parseIP(input)
  return `http://${ip}:${port}${path}`
}

export function formatIP(input) {
  return parseIP(input) || input
}
