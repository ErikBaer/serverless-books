import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getUploadUrl, updateBookUrl} from '../../businessLogic/books'







export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]


  const bookId = event.pathParameters.bookId

const signedUrl = getUploadUrl(bookId)
await updateBookUrl(bookId, jwtToken)
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
  }


