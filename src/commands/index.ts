import start from './start'
import help from './help'
import move from './move'
import readme from './readme'
import resign from './resign'
import newgamebot from './newgamebot'
import availablemoves from './availablemoves'

export const commands: { [key: string]: any } = {
  start,
  help,
  readme,
  resign,
  newgamebot,
  availablemoves,
  move
}
