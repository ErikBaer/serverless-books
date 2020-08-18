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
  
  let coverUrl = ''


  createBookRequest.coverUrl ? coverUrl = createBookRequest.coverUrl : coverUrl = ''
  

  return await booksAccess.createBook({
    bookId,
    userId,
    createdAt: new Date().toISOString(),
    name: createBookRequest.name,
    author: createBookRequest.author,
    topic: createBookRequest.topic,
    unread: createBookRequest.unread,
    coverUrl: coverUrl,
  })
}

export async function updateBook(
  updateBookRequest: UpdateBookRequest,
  bookId: string, jwtToken:string) {
  const userId = parseUserId(jwtToken)


  let coverUrl = ''

  updateBookRequest.coverUrl ? coverUrl = updateBookRequest.coverUrl : coverUrl = ''


return await booksAccess.updateBook({
  name: updateBookRequest.name,
  author: updateBookRequest.author,
  topic: updateBookRequest.topic,
  unread: updateBookRequest.unread,
  coverUrl: updateBookRequest.coverUrl
},
userId, bookId)

  }


export async function deleteTodo(
  todoId: string, jwtToken: string
) {
  const userId = parseUserId(jwtToken)
  

  return await booksAccess.deleteTodo(todoId, userId)
}


export function getUploadUrl(todoId) {
  
  const signedUrl = booksAccess.getUploadUrl(todoId)
  
  return signedUrl

}

export async function updateTodoUrl(todoId: string, jwtToken){
  const userId = parseUserId(jwtToken)
  return await booksAccess.updateTodoUrl(
      userId,
      todoId
  )
}