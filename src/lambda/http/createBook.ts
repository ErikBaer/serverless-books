import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
const logger = createLogger('dataLayer')

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateBookRequest } from '../../requests/CreateBookRequest'
import {createBook} from '../../businessLogic/books'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newBook: CreateBookRequest = JSON.parse(event.body)


  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  logger.info('Create a new book now!')

  const newItem = await createBook(newBook, jwtToken)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
