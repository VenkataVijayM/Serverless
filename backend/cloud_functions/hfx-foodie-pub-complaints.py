#Title - hfx-foodie-pub-complaints
#Author - Venkata Vijaya Mandapati
#Description - This file is reponsible to fetch message from lambda and publish that messaege to customer_complaints topic
#References - 
# 1 - https://cloud.google.com/pubsub/docs/publisher
import json
from google.cloud import pubsub_v1
def hello_world(request):

    request_json = request.get_json()
    
	#message format requried to publish
    message={}
    message['customerId']= request_json.get("customer")
    message['restaurantId'] = request_json.get("restaurant")
    message['orderId']= request_json.get("orderId")

    message_json = json.dumps(message)
    print(request_json)
	
	#fetching publisher options
    publisher = pubsub_v1.PublisherClient(
        publisher_options = pubsub_v1.types.PublisherOptions(
            enable_message_ordering=True,)
        )
    
    topic_path = 'projects/CSCI5410-F22/topics/customer_complaints'
	
	#publising the message
    publisher.publish(topic_path, message_json.encode("utf-8"))
    
    return f'Chat room pub sub done'