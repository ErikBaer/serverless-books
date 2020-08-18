import 'source-map-support/register'
import {getAllBooks} from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
const logger = createLogger('dataLayer')


import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user


// const authorization = event.headers.Authorization
//   const split = authorization.split(' ')
//   const jwtToken = split[1]

const jwtToken: string = '12345'

logger.info('Get all books now!')
const books = await getAllBooks(jwtToken)


const bookEvent = event
console.log(bookEvent)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: books
    })
  }
}
