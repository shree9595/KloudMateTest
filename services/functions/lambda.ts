// import the AWS SDK 
import AWS from "aws-sdk";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as uuid from "uuid";

// Database Table
import { Table } from "@serverless-stack/node/table";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/* SQS Configurtion */

// Set the region
AWS.config.update({ region: 'REGION' });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// SQS queue URL
const queueURL = "https://sqs.us-east-1.amazonaws.com/305172134505/Test";

// SQS Params
const sqsParams = {
  AttributeNames: [
    "SentTimestamp"
  ],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: [
    "All"
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0
};


// Lamabda Function
export const main: APIGatewayProxyHandlerV2 = async () => {

  const result = await callWithRetry()
  
  return result
};


// setTimeOut Function 
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const callWithRetry = async (retries = 0) => {

  // Get SQS Message
  const response = await sqs.receiveMessage(sqsParams).promise();

  if (response.err) {
    return {
      statusCode: 400,
      body: "SQS Message Error"
    }
  }

  // Check SQS Status (Condition)
  if (response.Messages[0].MessageAttributes?.Status?.StringValue === "fail") {

    // Maximum Retries
    const maxRetries = 2

    // Exponential backoff algorithm Logic
    if (retries < maxRetries) {
      const timeToWait = 2.5 ** retries * 600;
      console.log(timeToWait);
      await wait(timeToWait);
      return callWithRetry(retries + 1);
    } else {
      // DB  params
      const params = {
        TableName: Table.Payments.tableName,
        Item: {
          status: "fail",
          paymentId: uuid.v1(),
          createdAt: Date.now(),
        },
      };

      // Create DB Entries
      await dynamoDb.put(params).promise();

      // Send Successful responce
      return {
        statusCode: 200,
        body: params.Item
      }
    }
  }
}
