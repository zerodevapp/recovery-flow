const addressRegex = /^0x[a-fA-F0-9]{40}$/

export function isAddress(address: string): address is `0x${string}` {
  return addressRegex.test(address)
}