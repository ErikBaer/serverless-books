import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {deleteBook} from '../../businessLogic/books'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId

  // const authorization = event.headers.Authorization
  // const split = authorization.split(' ')
  // const jwtToken = split[1]

  const jwtToken: string = '12345'
 
  await deleteBook(bookId, jwtToken)

  return {
    statusCode: 204,
    headers: {
      'access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
