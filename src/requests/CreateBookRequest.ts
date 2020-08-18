/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateBookRequest {

  title: string
  author: string
  topic: string
  unread: boolean
  coverUrl?: string
}
