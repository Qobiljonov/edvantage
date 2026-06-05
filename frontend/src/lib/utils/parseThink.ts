export function extractThoughtsAndFinal(raw: string) {
  if (!raw) return { thoughts: [], finalText: '' }
  const thinkRegex = /<think>([\s\S]*?)<\/think>/gi
  const thoughts: string[] = []
  let cleaned = raw
  let m
  while ((m = thinkRegex.exec(raw)) !== null) {
    thoughts.push(m[1].trim())
  }
  // remove all think tags and their contents
  cleaned = cleaned.replace(thinkRegex, '')
  // Trim any leftover whitespace
  const finalText = cleaned.trim()
  return { thoughts, finalText }
}
