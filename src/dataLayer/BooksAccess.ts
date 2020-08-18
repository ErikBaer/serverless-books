import * as AWS  from 'aws-sdk'
process.env._X_AMZN_TRACE_ID = '_X_AMZN_TRACE_ID'

// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'

// const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('dataLayer')


import { BookItem } from '../models/BookItem'
// import { S3 } from 'aws-sdk'

export class BooksAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient({region: 'eu-central-1', endpoint: 'http://localhost:8000'}),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly indexName = process.env.INDEX_NAME,
    // private readonly s3: S3 =  new AWS.S3({
    //   signatureVersion: 'v4'
    // })
    ) {
  }

  async getAllBooks(userId: string): Promise<BookItem[]> {
    logger.info('Getting all Books')

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
      }).promise();

    const items = result.Items
    logger.info('Books where served', {
      // Additional information stored with a log statement
      userId
    })
    return items as BookItem[]
  }

  async createBook(book: BookItem): Promise<BookItem> {
    await this.docClient.put({
      TableName: this.booksTable,
      Item: book
    }).promise()

    logger.info('Book was succesfully created')
    return book
  }

  async updateBook(update: UpdateBookRequest, userId: string, bookId: string ): Promise<String> {

    const {title,topic, unread, author} = update
    
    const params = {
      TableName: this.booksTable,
      Key:                  
        {bookId,
        userId},
        
      
      UpdateExpression: "set #title=:ti, #author=:a, #topic=:to, #unread=:u",
      
      ExpressionAttributeValues : {
        ':ti': title,
        ':a': author,
        ':to': topic,
        ':u': unread
  
      }
      ,
      ExpressionAttributeNames:{
        '#title': 'title',
        '#author': 'author',
        '#topic': 'topic',
        '#unread': 'unread',
    
  
      },
      ReturnValues:"UPDATED_NEW"
  
  };

  logger.info('Book is getting updated ...', {
    // Additional information stored with a log statement
    userId
  })

  await this.docClient.update(params, function(err) {
    if (err) {
      logger.info("Unable to update book. ", {message: err.message});
    } else {
      logger.info("Update Book succeeded:");
    }
}).promise();

return 
}

  async deleteBook (bookId: string, userId:string) {
    
    const params = {
      TableName : this.booksTable,
      Key:                  
      {bookId,
      userId}, 
    }
    
    
    await this.docClient.delete(params, function(err) {
      if (err) {
        logger.info("Unable to delete book. ", {bookId, userId, message: err.message});
      } else {
        logger.info("Deleting Book succeeded:");
      }
  }).promise();
  
  }


  getUploadUrl(todoId: string) {
    const bucketName = process.env.ATTACHMENTS_S3_BUCKET
    const urlExpiration = process.env.urlExpiration
  
    const signedUrl = this.s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    })
    logger.info("SignedUrl succefully created")
    return signedUrl
  }

  async updateTodoUrl(userId: string, todoId: string ): Promise<String> {
    const bucketName = process.env.ATTACHMENTS_S3_BUCKET
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    
    const params = {
      TableName: this.todosTable,
      Key:                  
        {todoId,
        userId},
        
      
      UpdateExpression: "set #attachmentUrl = :a",
      
      ExpressionAttributeValues : {
        ':a': attachmentUrl
      }
      
      
      ,
      ExpressionAttributeNames:{
        '#attachmentUrl': 'attachmentUrl'
      },
      ReturnValues:"UPDATED_NEW"
  
  };

  logger.info("Updating the attachmentUrl...", {todoId, userId})

  await this.docClient.update(params, function(err) {
    if (err) {
      logger.info("Unable to update item", {todoId, userId, message: err.message});
    } else {
      logger.info("UpdateItem succeeded:",{todoId, userId});
    }
}).promise();

return 
}

}



