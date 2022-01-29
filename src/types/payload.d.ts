export interface User {
  id: string
  first_name: string
  last_name?: string
  username?: string
}

export interface Payload {
  update_id: number
  message: {
    message_id: number
    text: string
    date: number
    chat: User & {
      type: string
    }
    from: User & {
      language_code: string
      is_bot: boolean
    }
    entities: {
      type: string
    }[]
  }
}

export interface Event {
  body: string
}
