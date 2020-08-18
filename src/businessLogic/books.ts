import * as uuid from 'uuid'

import { BookItem } from '../models/BookItem'
import { BooksAccess } from '../dataLayer/BooksAccess'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { parseUserId } from '../auth/utils'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'


const booksAccess = new BooksAccess()

export async function getAllBooks(jwtToken): Promise<BookItem[]> {
  const userId = parseUserId(jwtToken)
  return booksAccess.getAllBooks(userId)
}

export async function createBook(
  createBookRequest: CreateBookRequest,
  jwtToken: string
): Promise<BookItem> {

  const bookId = uuid.v4()
  const userId = parseUserId(jwtToken)
  

  

  return await booksAccess.createBook({
    bookId,
    userId,
    createdAt: new Date().toISOString(),
    title: createBookRequest.title,
    author: createBookRequest.author,
    topic: createBookRequest.topic,
    unread: createBookRequest.unread,
    coverUrl: ''
  })
}

export async function updateBook(
  updateBookRequest: UpdateBookRequest,
  bookId: string, jwtToken:string) {
  const userId = parseUserId(jwtToken)


return await booksAccess.updateBook({
  title: updateBookRequest.title,
  author: updateBookRequest.author,
  topic: updateBookRequest.topic,
  unread: updateBookRequest.unread
},
userId, bookId)

  }


export async function deleteBook(
  bookId: string, jwtToken: string
) {
  const userId = parseUserId(jwtToken)
  

  return await booksAccess.deleteBook(bookId, userId)
}


export function getUploadUrl(bookId) {
  
  const signedUrl = booksAccess.getUploadUrl(bookId)
  
  return signedUrl

}

export async function updateBookUrl(bookId: string, jwtToken){
  const userId = parseUserId(jwtToken)
  return await booksAccess.updateBookUrl(
      userId,
      bookId
  )
}