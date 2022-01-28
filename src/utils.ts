export const makeId = (length = 6) => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const getCommandAndText = (txt: string) => {
  const [slashCommand, text] = txt.split(' ')
  const [, command] = slashCommand.split('/')

  return {
    command,
    text
  }
}

export const buildBoardMessage = (board: string) => `\`\`\`js\n${board}\n\`\`\``
