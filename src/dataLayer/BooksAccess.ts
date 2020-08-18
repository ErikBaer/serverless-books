import * as AWS  from 'aws-sdk'
process.env._X_AMZN_TRACE_ID = '_X_AMZN_TRACE_ID'

import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('dataLayer')


import { BookItem } from '../models/BookItem'
import { S3 } from 'aws-sdk'

export class BooksAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly indexName = process.env.INDEX_NAME,
    private readonly s3: S3 =  new XAWS.S3({
      signatureVersion: 'v4'
    })
    ) {
  }

  async getAllBooks(userId: string): Promise<BookItem[]> {
    logger.info('Getting all Books')

    let result

    try {
       result = await this.docClient.query({
        TableName: this.booksTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
        }).promise();

    } catch (err) {
      logger.info('Something went wrong', {message: err.message})
    }
    

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


  getUploadUrl(bookId: string) {
    const bucketName = process.env.COVER_S3_BUCKET
    const urlExpiration = 3600
  
    const signedUrl = this.s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: bookId,
      Expires: urlExpiration
    })
    logger.info("SignedUrl succefully created")
    return signedUrl
  }

  async updateBookUrl(userId: string, bookId: string ): Promise<String> {
    const bucketName = process.env.COVER_S3_BUCKET
    const coverUrl = `https://${bucketName}.s3.amazonaws.com/${bookId}`
    
    const params = {
      TableName: this.booksTable,
      Key:                  
        {bookId,
        userId},
        
      
      UpdateExpression: "set #coverUrl = :c",
      
      ExpressionAttributeValues : {
        ':c': coverUrl
      }
      
      
      ,
      ExpressionAttributeNames:{
        '#coverUrl': 'coverUrl'
      },
      ReturnValues:"UPDATED_NEW"
  
  };

  logger.info("Updating the coverUrl...", {bookId, userId})

  await this.docClient.update(params, function(err) {
    if (err) {
      logger.info("Unable to update item", {bookId, userId, message: err.message});
    } else {
      logger.info("UpdateItem succeeded:",{bookId, userId});
    }
}).promise();

return 
}

}



