import { sendMessage } from '../services'

const message = `
Hi there!

So, talking technically, I am a simple Serverless application designed by a guy called Carlos Daniel, made in NodeJs, and deployed on AWS - which means almost no cost to keep me running 💰.

You can get more information about me on my GitHub repository: https://github.com/carlosdnba/chessjsbot.

You can find my creator on his [LinkedIn](https://www.linkedin.com/in/carlosdnba/) or [Twitter](https://twitter.com/carlosdnba).

Have you found an issue? Please, report it [here](https://github.com/carlosdnba/chessjsbot/issues/new).
`

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat
  await sendMessage(message, id)
}
