import boto3
import json
import traceback

def lambda_handler(event, context):
    try:
        sns = boto3.client("sns")
        topicArn = "arn:aws:sns:us-east-1:119465344071:notifyTopic"

        # Check if any messages are present
        if 'Records' in event:
            message = event['Records'][0]
            message_attributes = message['messageAttributes']
            receipt_handle = message['receiptHandle']
            key = message_attributes['key']['stringValue']
            print("S3 key message ", key)
            response = get_s3_object_content(key)
            print("response ", response)
            message = ""
            if response:
                if response['Signature'] == False:
                    email_msg = ""
                    for key, value in response.items():
                        email_msg = email_msg + str(key)+" : "+ str(value) + "\n "
                    
                    message = "Please fill following fields and resubmit your SDA \n\n"+email_msg
                else:
                    message = "You have successfully submitted your SDA \n\n"
                data = {"default": message}
                response = sns.publish(
                    TopicArn=topicArn, Message=json.dumps(data), MessageStructure="json")

                message_id = response['MessageId']

                print("message_id", message_id)

                print('Email Sent Successfully!')
                return {
                    'statusCode': 200,
                    'body': json.dumps('Email Sent Successfully!')
                }
            else:
                return {
                    'statusCode': 400,
                    'body': json.dumps('Something went wrong')
                }
        else:
            print("No messages found in the SQS queue.")
            return {
                    'statusCode': 200,
                    'body': json.dumps('No messages found in the SQS queue.')
                }
        
    except Exception as e:
        print(traceback.format_exc())
        return {
                    'statusCode': 400,
                    'body': json.dumps(str(e))
                }
    

def extract(image_bytes):
    try:
        signature = []
        key_value = {}
        
        textract_client = boto3.client('textract')

        # Call Textract to detect text in the image
        response = textract_client.analyze_document(Document={'Bytes':image_bytes},FeatureTypes=['FORMS','SIGNATURES'])
        
        print("type ", type(response))
        for block in response['Blocks']:
            if block['BlockType'] == 'SIGNATURE':
                signature.append(block)
            if block['BlockType'] == 'KEY_VALUE_SET':
                form_key = ""
                form_value = ""
                if block['EntityTypes'][0] == 'KEY':
                    for relationship in block['Relationships']:
                        key = []
                        value = []
                        print("relationship ", relationship)
                        if relationship['Type'] == 'CHILD':
                            for child_id in relationship['Ids']:
                                for b in response['Blocks']:
                                    if b['Id'] == child_id:
                                        key.append(b['Text'])
                                        print("key text ", b['Text'])
                            form_key = ' '.join(key)
                        if relationship['Type'] == 'VALUE':
                            child_id = relationship['Ids'][0]
                            print("child id", child_id)
                            for value_block in response['Blocks']: 
                                if value_block['Id'] == child_id:
                                    print("value block ", value_block)
                                    for child_rel in value_block.get('Relationships',[]):
                                        if child_rel['Type'] == 'CHILD':
                                            for child in child_rel['Ids']:
                                                print("child ", child)
                                                for b in response['Blocks']:
                                                    if b['Id'] == child and b['BlockType'] == 'WORD':
                                                        print("value text ", b['Text'])
                                                        value.append(b['Text'])
                            form_value = ' '.join(value)

                # If both key and value are available, add them to the forms_data list
                if form_key or form_value:
                    key_value[form_key] = form_value

        # with open(file_path, 'w') as file:
        #     json.dump(response, file)
        response = {}
        if len(signature) > 0:
            response['Signature'] = True
        else:
            response['Signature'] = False

        for key, value in key_value.items():
            if value == '' or value == None:
                response[key] = value
        return response
    except Exception as e:
        print(traceback.format_exc())
        print(e)
        return None
        
def get_s3_object_content(key):
    # Initialize the S3 client
    s3 = boto3.client('s3')
    bucket_name = 'sda-bucket'

    try:
        # Get the object content
        response = s3.get_object(Bucket=bucket_name, Key=key)

        # Read and decode the content of the object
        object_content = response['Body'].read()

        response = extract(object_content)

        return response

    except Exception as e:
        return None
