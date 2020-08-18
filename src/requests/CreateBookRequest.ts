/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateBookRequest {

  name: string
  author: string
  topic: string
  unread: boolean
  coverUrl?: string
}
