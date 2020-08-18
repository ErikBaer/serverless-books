export interface BookItem {
  userId: string
  bookId: string
  createdAt: string
  name: string
  topic: string
  unread: boolean
  coverUrl?: string
  amazonUrl?: string
}
