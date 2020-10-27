import ibm_boto3
import json
from ibm_botocore.client import Config
from flask import Flask, request, jsonify
from flask_cors import CORS
import dash
import dash_html_components as html
# Nikhil Imports
from threading import Thread
from backend_analyzer import *
from base64 import b64encode, b64decode

# {
#   "apikey": "vb4YJRLAZlHTiVtTkIwW9PTUfxrVp6ka7zKwod0D2opC",
#   "endpoints": "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
#   "iam_apikey_description": "Auto-generated for key 0b46f763-6807-4a0a-bb46-7a0048b16a0a",
#   "iam_apikey_name": "user-metadata-1",
#   "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
#   "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/10e078ad68c845bc9417932fd4776cc3::serviceid:ServiceId-3e5ed54d-1886-44dd-b7f0-b40c551a497d",
#   "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/10e078ad68c845bc9417932fd4776cc3:3e5b8495-2ffc-4bff-af12-37255369051a::"
# }

{
  "apikey": "S3zEnRiuIZsPXLvKBUx_FvEd9_xgF36jSBXX-pPOL-Ok",
  "endpoints": "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
  "iam_apikey_description": "Auto-generated for key 79bc37f5-6f50-4ac7-ba83-a95c175889a4",
  "iam_apikey_name": "cloud-object-storage-4h-cos-standard-n3p",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/6635ba9b3f534ac0b5e84b3e7336681e::serviceid:ServiceId-1d11a170-6af7-4c3c-a647-1baf87d644cc",
  "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/6635ba9b3f534ac0b5e84b3e7336681e:6b8c8b53-0338-4160-b79d-2cb1dad55345::"
}


# Credentials
# New
COS_ENDPOINT = "https://s3.jp-tok.cloud-object-storage.appdomain.cloud"
COS_API_KEY_ID = "S3zEnRiuIZsPXLvKBUx_FvEd9_xgF36jSBXX-pPOL-Ok"
COS_AUTH_ENDPOINT = "https://iam.cloud.ibm.com/identity/token"
SERVICE_INSTANCE_ID = "6b8c8b53-0338-4160-b79d-2cb1dad55345"
# COS_ENDPOINT = "https://s3.jp-tok.cloud-object-storage.appdomain.cloud"
# COS_API_KEY_ID = "1U49qzKPQagsbohJkFx-HVmjsPyB-H6370rGLKmsv6O0"
# COS_AUTH_ENDPOINT = "https://iam.cloud.ibm.com/identity/token"
# SERVICE_INSTANCE_ID = "f5d8b01b-fdf5-4420-b5e2-65b5ef4a6ced"
# Old
# COS_ENDPOINT = "https://s3.jp-tok.cloud-object-storage.appdomain.cloud"
# COS_API_KEY_ID = "vb4YJRLAZlHTiVtTkIwW9PTUfxrVp6ka7zKwod0D2opC"
# COS_AUTH_ENDPOINT = "https://iam.cloud.ibm.com/identity/token"
# SERVICE_INSTANCE_ID = "3e5b8495-2ffc-4bff-af12-37255369051a"

# Create resources
cos = ibm_boto3.resource(
    "s3",
    ibm_api_key_id=COS_API_KEY_ID,
    ibm_service_instance_id=SERVICE_INSTANCE_ID,
    ibm_auth_endpoint=COS_AUTH_ENDPOINT,
    config=Config(signature_version="oauth"),
    endpoint_url=COS_ENDPOINT,
)
bucket_name = "cloud-object-storage-4h-cos-standard-n3p"


# CORS
app = Flask(__name__)
cors = CORS(app)
# @crossdomain(origin='*',headers=['access-control-allow-origin','Content-Type'])s


@app.route("/", methods=["GET"])
def hello():
    x = '{ "status":"working"}'
    return x


@app.route("/createform", methods=["POST"])
def forms():

    ### Decode request
    data_string = request.data.decode("utf-8")
    data_json = json.loads(data_string)
    data_json["status_stage"] = "jobCreated"
    data_string = json.dumps(data_json)

    # app.logger.info(type(data_string))
    # app.logger.info(type(data_json))
    # app.logger.info(data_json)
    # app.logger.info(data_string)

    status_code = None
    message = ""

    ### Put request
    try:
        message = "Job Added Successfully!"
        cos_response = cos.Object(bucket_name, data_json["jobTitle"] + ".json").put(
            Body=data_string
        )
        # COS status
        status_code = cos_response["ResponseMetadata"].get("HTTPStatusCode")
        if status_code != 200:
            message = "Failed to Add Job! Try again"
    except Exception as e:
        message = "Failed to Add Job!", e.__class__, "occurred."

    response = {"status": status_code, "message": message}
    app.logger.info(response)

    return jsonify(response)


@app.route("/jobs", methods=["GET"])
def getJobs():

    files = cos.Bucket(bucket_name).objects.all()
    item_names = []

    for file in files:
        name = file.key.split(".")
        if name[len(name) - 1] == "json":
            file = cos.Object(bucket_name, file.key).get()
            data_bytes = file["Body"].read()
            data_string = data_bytes.decode("utf-8")
            temp_dict = json.loads(data_string)
            # app.logger.info(type(temp_dict))

            if "status_stage" in temp_dict.keys():
                if temp_dict["status_stage"] == "jobCreated":
                    item_names.append(temp_dict)

    # app.logger.info(type(item_names[0]))
    # app.logger.info(type(jsonify(item_names)))

    return jsonify(item_names)


@app.route("/jobs/<jobname>", methods=["GET"])
def getapplicationids(jobname):

    x = '{ "status":"working"}'

    app.logger.info(jobname)
    files = cos.Bucket(bucket_name).objects.all()
    item_names = []

    for file in files:
        name = file.key.split(".")
        if name[len(name) - 1] == "json":
            file = cos.Object(bucket_name, file.key).get()
            data_bytes = file["Body"].read()
            data_string = data_bytes.decode("utf-8")
            temp_dict = json.loads(data_string)
            try:
                print("here", temp_dict['applicationId'], temp_dict['jobTitle'])
            except:
                print("notfound")

            if "jobTitle" in temp_dict.keys():
                if temp_dict["jobTitle"].strip() == jobname.strip():
                    try:
                        print("Inside", temp_dict['applicationId'], temp_dict['jobTitle'])
                    except:
                        print("not found", temp_dict["jobTitle"])
                    item_names.append(temp_dict)

    # file = cos.Object(bucket_name, "index.html").get()
    # data_bytes = file["Body"].read()
    # data_string = data_bytes.decode("utf-8")
    # # app.logger.info("File Contents: {0}".format(file["Body"].read()))
    # response = {"message": data_string}
    # app.logger.info(item_names)

    return jsonify(item_names)


@app.route("/applications/<applicationid>", methods=["GET"])
def getapplication(applicationid):

    x = '{ "status":"working"}'

    app.logger.info(applicationid)
    files = cos.Bucket(bucket_name).objects.all()
    item_names = []

    for file in files:
        name = file.key.split(".")
        if name[len(name) - 1] == "json":
            file = cos.Object(bucket_name, file.key).get()
            data_bytes = file["Body"].read()
            data_string = data_bytes.decode("utf-8")
            temp_dict = json.loads(data_string)
            # app.logger.info(type(temp_dict))

            if "applicationId" in temp_dict.keys():
                if temp_dict["applicationId"] == applicationid:
                    response = temp_dict
                    item_names.append(temp_dict)

    # app.logger.info(item_names)

    return jsonify(item_names)

########## Rahul Development ##########
@app.route("/submitData", methods=["POST"])
def chatData():
    # print(request.form['resume'])
    print(request.form['applicationId'])
    print(request.form['linkedInUserName'])
    print(request.form['githubUserName'])
    print(request.form['jobTitle'])
    print(request.form['twitterUserName'])
    response = {"status": 200, 
                "message": "Yayy! Started the backend analyzer core component. Sit back, relax, have a cup of tea. Got you covered!"}

    data = json.dumps({
        "applicationId": request.form['applicationId'],
        "linkedInUserName": request.form['linkedInUserName'].strip().split('/')[-1],
        "githubUserName": request.form['githubUserName'].strip().split('/')[-1],
        "twitterUserName": request.form['twitterUserName'].strip().split('/')[-1],
        "jobTitle": request.form['jobTitle'],
        "resume":request.form['resume'],
        "1": request.form['1'],
        "2": request.form['2'],
        "3": request.form['3'],
        "score_skills": request.form['score_skills'],
        "score_exp": request.form['score_exp'],
        "score_github": request.form['score_github'],
        "score_academics": request.form['score_academics'],
    })

    # print("JSON DATA:: -> " ,data[linkedInUserName']);
    # print("JSON DATA:: -> " ,data['githubUserName']);
    # "backend_analyzed" : True
    thread = Thread(target = call_backend_analyze_multiple, args = (data, ))
    thread.start()
    app.logger.info("Backend Analyser thread Started")

    app.logger.info(response)

    return jsonify(response)


########## Nikhil Development ##########
def getData(uri):
    head, data = uri.split(',')
    # decoded =data.decode('base64','strict');
    # print("RESUME ---> " , data);
    return data

def call_backend_analyze_multiple(data):
    data = json.loads(data)
    print("GITHUB ---------->" ,data['githubUserName'])
    print("LINKEDIN ---------->" ,data['linkedInUserName'])
    print("Twitter ---------->" ,data['twitterUserName'])
    to_write_resume = getData(data['resume'])
    # to_write_resume = data['resume']
    file_path = data['applicationId'] + "_resume.docx"
    # with open(file_path, 'wb') as file:
    with open(file_path, 'wb+') as file:
        file.write(b64decode(to_write_resume.encode('utf-8')))
    main(data['applicationId'], file_path, 'nikhiljsk', '', data['githubUserName'], 
                app, __name__, cos, bucket_name, data, data['twitterUserName'])
    return "Called backend"

@app.route("/submitData_dup", methods=["GET"])
def dup_chatData():
    with open('Resume_Nikhil_JSK.docx', 'rb') as open_file:
        byte_content = open_file.read()
    base64_bytes = b64encode(byte_content)
    base64_string = base64_bytes.decode('utf-8')

    # Chatbot Conv.
    text_1 = "I am a very good communicatory and find it's easy for me to relate to other people. I really enjoy learning new things and constantly seeking out new learning opportunities. My experience as intern provided me with unique technical skills that I can apply to this role and gave me an opportunity to understand the ins-and-outs of the industry, and to take on tasks I might not have at a larger company. I think this experience gives me a slight edge over other applicants. I'm not afraid of failure. In fact, I think it is an essential part of the experimental process that gets you to success. When solving problems, I apply both logic and emotional aspects in equal proportion."
    text_2 = "When I was a junior, I worked on a case project for a marketing class where six of us were asked to analyze the marketing practices of Amazon.com and make recommendations for alternative approaches. Early on we floundered in an effort to find a focus. I suggested that we look at Amazon's advertising strategy within social media.I led a discussion about the pros and cons of that topic and encouraged a couple of the more reticent members to chime in. Two of the group members didn't initially embrace my original proposal.However, I was able to draw consensus after incorporating their suggestion that we focus on targeted advertising within Facebook based on users' expressed interests. We ended up working hard as a group, receiving very positive feedback from our professor, and getting an A grade on the project."
    text_3 = "I never worked as a team and I am not at all interested in teams, As in team we don’t have the freedom for individual decision. I feel that there is a lot of waste in time for team work as huge time loss is gone for discussions and conclusion. And also working in team can lead to many misunderstandings during tough situations. As each person has his/her own perspective it will be difficult to work as a team. So, I feel working alone is better than working as a team."
        
    response = {"status": 200, 
                "message": "Yayy! Started the backend analyzer core component. Sit back, relax, have a cup of tea. Got you covered!"}

    data = json.dumps({
        "applicationId": "11601794",
        "linkedInUserName": "nikhiljsk",
        "githubUserName": "nikhiljsk",
        "twitterUserName": "nikhiljsk",
        "jobTitle": "Data Scientist",
        "resume": base64_string,
        "1": text_1,
        "2": text_2,
        "3": text_3,
        "score_skills": "50",
        "score_exp": "50",
        "score_github": "50",
        "score_academics": "50",
    })
    # "backend_analyzed" : True
    thread = Thread(target = call_backend_analyze_multiple, args = (data, ))
    thread.start()
    app.logger.info("Backend Analyser thread Started")

    app.logger.info(response)

    return jsonify(response)

@app.route("/getStatus", methods=["POST"])
def get_application_status():
    print("Status request for:", request.form['applicationId'])
    applicationid = request.form['applicationId']
    files = cos.Bucket(bucket_name).objects.all()
    item_names = []
    for file in files:
        name = file.key.split(".")
        if name[len(name) - 1] == "json":
            file = cos.Object(bucket_name, file.key).get()
            data_bytes = file["Body"].read()
            data_string = data_bytes.decode("utf-8")
            temp_dict = json.loads(data_string)
            # app.logger.info(type(temp_dict))

            if "applicationId" in temp_dict.keys():
                if temp_dict["applicationId"] == applicationid:
                    response = temp_dict
                    break
    try:
        if "shortlisted" in response.keys():
            return json.dumps({"response": "Application Analysed. Employer decision awaited"})
        else:
            return json.dumps({"response": "Application being analysed."})
    except:
        return json.dumps({"response": "Application being analysed."})


@app.route("/getRelevantJob", methods=["POST"])
def get_relevant_job():
    print("Status request for:", request.form['applicationId'])
    applicationid = request.form['applicationId']
    files = cos.Bucket(bucket_name).objects.all()
    item_names = []
    for file in files:
        name = file.key.split(".")
        if name[len(name) - 1] == "json":
            file = cos.Object(bucket_name, file.key).get()
            data_bytes = file["Body"].read()
            data_string = data_bytes.decode("utf-8")
            temp_dict = json.loads(data_string)
            # app.logger.info(type(temp_dict))

            if "applicationId" in temp_dict.keys():
                if temp_dict["applicationId"] == applicationid:
                    response = temp_dict
                    break
    try:
        if "shortlisted" in response.keys() and "relevant_job" in response.keys():
            return json.dumps({"response": response['relevant_job']})
        else:
            return json.dumps({"response": "Application being analysed."})
    except:
        return json.dumps({"response": "Application being analysed."})


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=4003)
