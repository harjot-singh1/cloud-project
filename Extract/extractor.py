import json
import base64
import traceback
import boto3

s3 = boto3.client('s3')
bucket_name = 'sda-bucket'

headers = {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        }

def lambda_handler(event, context):
  try:
      image_data_base64 = event['body']
      image_data = base64.b64decode(image_data_base64)
      
      
      query_params = event['queryStringParameters']
      bannerId = query_params.get('bannerId')
      assignment_no = query_params.get('assignment')
      object_name = bannerId+'/' + 'assignment_'+assignment_no+'.jpg'
      
      
      s3.put_object(Bucket=bucket_name, Key=object_name, Body=image_data)
      
      resp = {
          "key": {'DataType': 'String', 'StringValue': object_name}
      }
      
      # Created Sns client
      sns = boto3.client("sns")
      name = "extractTopic"

      topicArn = "arn:aws:sns:us-east-1:119465344071:extractTopic"
      message = "New SDA Arrived"
      
      try:
          response = sns.publish(
              TopicArn=topicArn, Message=message, MessageAttributes=resp)
          message_id = response['MessageId']

      except ClientError as e:
          return {
              'statusCode': 400,
              'headers':headers,
              'body': json.dumps(str(e))
          }
          
      print("request before error")
      return {
          'statusCode': 200,
          'headers': headers,
          'body': json.dumps('File uploaded successfully')
      }
  except Exception as e:
      print(traceback.format_exc())
      return {
          'statusCode': 400,
          'headers':headers,
          'body': json.dumps(str(e))
      }
