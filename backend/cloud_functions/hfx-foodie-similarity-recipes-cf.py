#Title - hfx-foodie-similarity-recipes-cf
#Author - Venkata Vijaya Mandapati
#Description - This file responsible for recieving data from lambda and fetching similar recipies using ML model in Bigquery
#References - https://cloud.google.com/bigquery/docs/
from google.cloud import bigquery

def hello_world(request):

	#storing json input recieved from lambda
    request_json = request.get_json()
    print(request_json)
    
    client = bigquery.Client()
    
	#Query that is responsible to fetch similar recipes from ML model
    statement = """select string_field_0 from `csci5410-f22.serverless.recipe_cluster` where CENTROID_ID = (
		SELECT distinct centroid_id FROM
		ML.PREDICT( MODEL `serverless.similarity_model`,
		(
		SELECT 
		"""+'"'+request_json['recipie_name']+'"'+""" as string_field_0,	"""+'"'+request_json['ingredients']+'"'+""" as string_field_1
		FROM
		`csci5410-f22.serverless.recipies`))) LIMIT 10""";
    
	#Sending similar recipes response back to lambda
    resp = client.query(statement).to_dataframe().to_json();
    print(resp)

    return resp
