const TOKEN_SELF = import.meta.env.VITE_TOKEN_SELF
const TOKEN_MOTHER = import.meta.env.VITE_TOKEN_MOTHER

console.log("TOKEN_SELF:", TOKEN_SELF)
console.log("TOKEN_MOTHER:", TOKEN_MOTHER)

const TOKEN_MAP = {
  [TOKEN_SELF]: { user: 'self', partner: 'mother', label: '自分' },
  [TOKEN_MOTHER]: { user: 'mother', partner: 'self', label: '母' },
}

export function resolveIdentityFromToken(token) {
  console.log("URL token:", token)
  console.log("TOKEN_SELF length:", TOKEN_SELF?.length)
  console.log("URL token length:", token?.length)
  console.log("EXACT MATCH:", TOKEN_SELF === token)
  console.log("TOKEN_MAP:", TOKEN_MAP)

  if (!token) return null
  return TOKEN_MAP[token] ?? null
}