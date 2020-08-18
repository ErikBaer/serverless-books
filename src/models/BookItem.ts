export interface BookItem {
  userId: string
  bookId: string
  createdAt: string
  name: string
  author: string
  topic: string
  unread: boolean
  coverUrl?: string
}
