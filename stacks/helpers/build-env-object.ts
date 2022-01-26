/* eslint-disable @typescript-eslint/strict-boolean-expressions */
interface EnvironmentVariableHolder {
  [key: string]: string
}

export function buildEnvVarObject (vars: string[]): EnvironmentVariableHolder {
  const output: EnvironmentVariableHolder = {}
  vars.forEach((envVar) => {
    const varName = envVar as keyof EnvironmentVariableHolder
    if (!process.env[varName]) return
    output[varName] = process.env[varName] as string
  })
  return output
}
