import AWS from "aws-sdk";
import { Table } from "@serverless-stack/node/table";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function main() {

  const params = {
    TableName: Table.Payments.tableName,
  }

  const results = await dynamoDb.scan(params).promise();

  return {
    statusCode: 200,
    body: results.Items,
  };
}
