import * as AWS  from 'aws-sdk'
process.env._X_AMZN_TRACE_ID = '_X_AMZN_TRACE_ID'

import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('dataLayer')


import { TodoItem } from '../models/TodoItem'
import { S3 } from 'aws-sdk'

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME,
    private readonly s3: S3 =  new XAWS.S3({
      signatureVersion: 'v4'
    })) {
  }

  async getAllTodos(userId): Promise<TodoItem[]> {
    logger.info('Getting all Todos')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
      }).promise();

    const items = result.Items
    logger.info('Todos where served', {
      // Additional information stored with a log statement
      userId
    })
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    logger.info('Todo was succesfully created')
    return todo
  }

  async updateTodo(update: UpdateTodoRequest, userId: string, todoId: string ): Promise<String> {

    const {name,dueDate,done} = update
    
    const params = {
      TableName: this.todosTable,
      Key:                  
        {todoId,
        userId},
        
      
      UpdateExpression: "set #name=:n, #dueDate=:dD, #done=:d",
      
      ExpressionAttributeValues : {
        ':n': name,
        ':dD': dueDate,
        ':d': done
      }
      
      
      ,
      ExpressionAttributeNames:{
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ReturnValues:"UPDATED_NEW"
  
  };

  logger.info('Item is getting updated ...', {
    // Additional information stored with a log statement
    userId
  })

  await this.docClient.update(params, function(err) {
    if (err) {
      logger.info("Unable to update item. ", {message: err.message});
    } else {
      logger.info("UpdateItem succeeded:");
    }
}).promise();

return 
}

  async deleteTodo (todoId: string, userId:string) {
    
    const params = {
      TableName : this.todosTable,
      Key:                  
      {todoId,
      userId},
    }
    
    
    await this.docClient.delete(params, function(err) {
      if (err) {
        logger.info("Unable to delete item. ", {todoId, userId, message: err.message});
      } else {
        logger.info("DeleteItem succeeded:");
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



