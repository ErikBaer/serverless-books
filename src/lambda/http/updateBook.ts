import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
const logger = createLogger('dataLayer')

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import {updateBook} from '../../businessLogic/books'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId
  const updatedBook: UpdateBookRequest = JSON.parse(event.body)

  // const authorization = event.headers.Authorization
  // const split = authorization.split(' ')
  // const jwtToken = split[1]

  const jwtToken: string = '12345'

  logger.info('Update a specific book now!')

  await updateBook(updatedBook, bookId, jwtToken)
  


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
