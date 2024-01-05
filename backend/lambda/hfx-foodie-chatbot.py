import json
import uuid
import boto3
import urllib3

url = urllib3.PoolManager()

intent_GetOrderStatus = "GetOrderStatus" 
intent_AddRecipe = "AddRecipe"
intent_OrderRelatedIssues = "OrderRelatedIssues"
intent_AddOrderRatings = "AddOrderRatings"
intent_AddOrderFeedback = "AddOrderFeedback"
intent_NavigationalIssues = "NavigationalIssues"

client = boto3.resource('dynamodb')

def lambda_handler(event, context):
    print(event)
    intent = event["interpretations"][0]["intent"]["name"]
    
    if intent=='GetOrderStatus':
        userOrderId = event['interpretations'][0]['intent']['slots']['order_id']['value']['interpretedValue']
        result = get_order_status(userOrderId)
        return result
    elif intent=='AddRecipe':
        userEmail = event["interpretations"][0]["intent"]["slots"]["email"]["value"]["interpretedValue"]
        userPassword = event["interpretations"][0]["intent"]["slots"]["password"]["value"]["interpretedValue"]
        userRecipeName = event['interpretations'][0]['intent']['slots']['recipe_name']['value']['interpretedValue']
        userRecipePrice = event['interpretations'][0]['intent']['slots']['recipe_price']['value']['interpretedValue']
        result = add_recipe(userEmail,userPassword,userRecipeName,userRecipePrice)
        return result
    elif intent=='OrderRelatedIssues':
        userOrderId = event['interpretations'][0]['intent']['slots']['order_id']['value']['interpretedValue']
        result = order_complaints(userOrderId)
        return result
    elif intent=='AddOrderRatings':
        userEmail = event["interpretations"][0]["intent"]["slots"]["user_email"]["value"]["interpretedValue"]
        userOrderId = event['interpretations'][0]['intent']['slots']['order_id']['value']['interpretedValue']
        userOrderRatings = event['interpretations'][0]['intent']['slots']['order_ratings']['value']['interpretedValue']
        result = add_order_ratings(userEmail,userOrderId,userOrderRatings)
        return result
    elif intent=='AddOrderFeedback':
        userEmail = event["interpretations"][0]["intent"]["slots"]["user_email"]["value"]["interpretedValue"]
        userOrderFeedback = event['interpretations'][0]['intent']['slots']['order_feedback']['value']['interpretedValue']
        userOrderId = event['interpretations'][0]['intent']['slots']['order_id']['value']['interpretedValue']
        result = add_order_feedback(userEmail,userOrderId,userOrderFeedback)
        return result
    elif intent=='NavigationalIssues':
        result = navigation()
        return result

def get_order_status(userOrderId):
    result = {}
    output={}

    tablename = client.Table('hfx_foodie_orders')
    output = tablename.get_item(
    Key={
        'orderId':userOrderId
    }
    )
    item = output['Item']
    print(item)

    msg = "Error occured. Try Again."
    state = "Failed"
    if(output is not None):
        if(item['orderId']==userOrderId ):
            status=item['order_status']
            msg="Status : "+ status
            state = "Fulfilled"
            print("Status visible to the user")

    result = {
        "sessionState" : {
            "dialogAction":{
                "type":"Close"
            },
            "intent" : {
                "name" : intent_GetOrderStatus,
                "state":state
            }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content":msg
        }]
    }
    print(result)
    return result

def add_recipe(userEmail,userPassword,userRecipeName,userRecipePrice):
    result = {}
    output={}
    #validate user and fetch userid from dynamodb
    userTable = client.Table('user_master')
    output = userTable.get_item(
    Key={
        'email':userEmail
    }
    )
    item = output['Item']
    print(item)

    msg = "Invalid Username or Password. Please try again"
    state = "Failed"

    if(output is not None):
        if(item['email']==userEmail and item['password']==userPassword and item['isRestaurant']=="True"):
            userId=item['userId']
            print("User Id fetched sucessfully")
            #add recipe in dynamodb
            recipeTable = client.Table('hfx_foodie_recipes')
            recipeTable.put_item(
            Item={
                'recipeId': str(uuid.uuid4()),
                'ingredients': [],
                'isUploaded': False,
                'price': userRecipePrice,
                'recipeName': userRecipeName,
                'userId':userId
            }
            )
            
            msg="Recipe Added Successfully"
            state = "Fulfilled"
            print("Recipe  Added Successfully")
        else:
            msg = "Invalid Username or Password. Please try again"
            state = "Failed"

    result = {
        "sessionState" : {
            "dialogAction":{
                "type":"Close"
            },
            "intent" : {
                "name" : intent_AddRecipe,
                "state":state
            }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content":msg
        }]
    }
    print(result)
    return result

def order_complaints(userOrderId):
    orderTable = client.Table('hfx_foodie_orders')
    output = orderTable.get_item(
    Key={
        'orderId':userOrderId
    }
    )
    item = output['Item']
    print(item)

    if(output is not None):
        if(item['orderId']==userOrderId):
            restaurant=item['restaurant']
            userEmail=item['customer']

        myurl='https://us-central1-csci5410-f22.cloudfunctions.net/pub_complaints'
        output={
                    'orderId': userOrderId,
                    'customer': userEmail,
                    'restaurant': restaurant   
                }

        response = url.request('POST',myurl,body=json.dumps(output) ,headers={'Content-Type':'application/json'},retries=False)
        print(response.data)    
        return {
                "sessionState" : {
                "dialogAction":{
                "type":"Close"
                 },
                "intent" : {
                    "name" : intent_OrderRelatedIssues,
                    "state":"Fulfilled"
                }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content":"You can connect with our representative from the chat tab."
        }]
            }
    else:
        {
        "sessionState" : {
            "dialogAction":{
                "type":"Close"
            },
            "intent" : {
                "name" : intent_OrderRelatedIssues,
                "state":"Failed"
            }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content":"Invalid Order Id. Please check again."
        }]
    }

def add_order_ratings(userEmail,userOrderId,userOrderRatings):
    result = {}
    output={}
    userTable = client.Table('user_master')
    output = userTable.get_item(
    Key={
        'email':userEmail
    }
    )
    item = output['Item']
    print(item)

    msg = "Invalid Username. Please try again"
    state = "Failed"
    if(output is not None):
        tablename = client.Table('hfx_foodie_orders')
        tablename.update_item(
            Key={
                'orderId':userOrderId
            },
            UpdateExpression='SET order_ratings = :val1',
            ExpressionAttributeValues={
                ':val1': userOrderRatings
            }
        )
        msg="Thanks for your ratings."
        state = "Fulfilled"
    else:
        msg = "Invalid Username or Password. Please try again"
        state = "Failed"

    result = {
        "sessionState" : {
            "dialogAction":{
                "type":"Close"
            },
            "intent" : {
                "name" : intent_AddOrderRatings,
                "state":state
            }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content":msg
        }]
    }
    print(result)
    return result

def add_order_feedback(userEmail,userOrderId,userOrderFeedback):
    result = {}
    output={}
    userTable = client.Table('user_master')
    output = userTable.get_item(
    Key={
        'email':userEmail
    }
    )
    item = output['Item']
    print(item)

    msg = "Invalid Username. Please try again"
    state = "Failed"
    if(output is not None):
        tablename = client.Table('hfx_foodie_orders')
        tablename.update_item(
            Key={
                'orderId':userOrderId
            },
            UpdateExpression='SET order_feedback = :val1',
            ExpressionAttributeValues={
                ':val1': userOrderFeedback
            }
        )
        msg="Thanks for your feedback."
        state = "Fulfilled"
    else:
        msg = "Invalid Username or Password. Please try again"
        state = "Failed"

    result = {
        "sessionState" : {
            "dialogAction":{
                "type":"Close"
            },
            "intent" : {
                "name" : intent_AddOrderFeedback,
                "state":state
            }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content":msg
        }]
    }
    print(result)
    return result

def navigation():
    message = "Please visit https://dal.brightspace.com/d2l/login "
    return {
        "sessionState" : {
            "dialogAction":{
                "type":"Close"
            },
            "intent" : {
                "name" : intent_NavigationalIssues,
                "state":"Fulfilled"
            }   
        },
        "messages":[{
            "contentType" : "PlainText",
            "content": message
        }]
    }

