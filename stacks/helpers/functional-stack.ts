import * as sst from "@serverless-stack/resources"

export type FunctionalStackProps = {
  app: sst.App
  stack: sst.Stack
}

export type FunctionalStack<T> = (props: FunctionalStackProps) => T

let currentApp: sst.App | undefined = undefined
const cache: Record<string, any> = {}

class EmptyStack extends sst.Stack {
  constructor(scope: sst.App, id: string) {
    super(scope, id)
  }
}

export function createStacks(app: sst.App, ...fns: FunctionalStack<any>[]) {
  currentApp = app
  for (const fn of fns) {
    const name = fn.name.toLowerCase()
    const exists = cache[name]
    if (exists) continue
    const stack = new EmptyStack(app, name)
    const result = fn({
      app,
      stack,
    })
    console.log(`Synthesized stack ${name}`)
    cache[name] = result
  }
}

export function defineStack<T>(cb: FunctionalStack<T>) {
  return cb
}

export function use<T>(stack: FunctionalStack<T>): T {
  if (!currentApp) throw new Error("No app is set")
  const name = stack.name.toLowerCase()
  const exists = cache[name]
  if (exists) return exists
  createStacks(currentApp, stack)
  return use(stack)
}
