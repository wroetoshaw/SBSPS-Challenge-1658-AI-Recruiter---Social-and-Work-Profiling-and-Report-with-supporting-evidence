#imports
from watson_developer_cloud import PersonalityInsightsV3
import json
import sys
import pandas as pd
import seaborn as sns
from matplotlib import pyplot as plt
import warnings
warnings.filterwarnings("ignore")
import base64
import plotly.express as px
from tweepy import OAuthHandler
from tweepy import API
from tweepy import Cursor
import tweepy
import json
import sys
import pprint
from wordcloud import WordCloud, STOPWORDS
import numpy as np
import requests
from PIL import Image

#Logging

# unique_id = "11601794"

def connect():
        url = 'https://api.eu-gb.personality-insights.watson.cloud.ibm.com/instances/62b0977a-b9c4-4cee-8c06-5ef6d5c3bf9c'
        apikey = 'GO2j92bbgiE_R_sROJj9hckkpJl_rVjX4laAX_XfsUtR'
        version = '2017-10-13'
        service = PersonalityInsightsV3(url = url ,iam_apikey = apikey ,version= version)
        print("\n")
        print("Connection Successful")
        return service
    
    
def gettingInsights(text, service, user):
        print("Getting Insights for {} Social Data".format(user))
        profile = service.profile(text,content_type = 'text/plain').get_result()
        return profile
    
def visualize(profile, unique_id):
    print("Visualizing the Generated Insights")
    required_keys = ['personality', 'needs', 'values']
    df = pd.DataFrame()
    filterd_data = {key['name']:key['percentile'] for key in profile['personality']}
    df_key = pd.DataFrame.from_dict(filterd_data,orient= 'index')
    df_key.reset_index(inplace=True)
    df_key.columns = ['personality','percentile']
    df_key['percentile'] = df_key['percentile']*100
    df = df_key
    data = px.data.gapminder()
    fig_persona = px.bar(df, x='personality', y='percentile', color='percentile'
                 ,title="Persona Of the Applicant", height=500,width=500)
    filterd_data = {key['name']:key['percentile'] for key in profile['needs']}
    df_key = pd.DataFrame.from_dict(filterd_data,orient= 'index')
    df_key.reset_index(inplace=True)
    df_key.columns = ['needs','percentile']
    df_key['percentile'] = df_key['percentile']*100
    df_key = df_key.loc[df_key['percentile'] > 60]
    df = df_key
    fig_areaOfImp = px.pie(df, values='percentile', names='needs', title='Areas of Improvement ', height=500, width=500)
    
    
    filterd_data = {key['name']:key['percentile'] for key in profile['values']}
    df_key = pd.DataFrame.from_dict(filterd_data,orient= 'index')
    df_key.reset_index(inplace=True)
    df_key.columns = ['values','percentile']
    df_key['percentile'] = df_key['percentile']*100
    df = df_key
    fig_values = px.bar(df, x='values', y='percentile', color='percentile'
                 ,title="Values of The Applicant", height=500,width=500)
    print("Saving persona of User with file name {}".format(unique_id + '_fig_persona.html'))
    with open(unique_id + '_fig_persona.html', 'w') as f:
        f.write(fig_persona.to_html(full_html=False, include_plotlyjs='cdn'))
    print("Saving Areas of Improvement of User with file name {}".format(unique_id + '_fig_areaOfImp.html'))
    with open(unique_id + '_fig_areaOfImp.html', 'w') as f:
        f.write(fig_areaOfImp.to_html(full_html=False, include_plotlyjs='cdn'))
    print("Saving Values of User with file name {}".format(unique_id + '_fig_values.html'))   
    with open(unique_id + '_fig_values.html', 'w') as f:
        f.write(fig_values.to_html(full_html=False, include_plotlyjs='cdn'))

def recursive_items(dictionary):
    for key, value in dictionary.items():
        if type(value) is dict:
            yield (key, value)
            yield from recursive_items(value)
        else:
            yield (key, value)


def getLinkedIn_details(user):
    print("Getting Twitter Credentials for user {}".format(user))
    url = "https://api.linkedin.com/v2/me"
    token = "AQX7AYJ_wACoXPE774ON88wtw8T-NdnAMLVt6NMqOlx78fbvVNPp_jywXf2mACRxGZUTYRpeXlY_xdSrYv0y6QEW7JE7v09LXGIFmF6A_vmsDfBwAHJn8h0UHT08sb1blVNEFLweOc7SXF8Y22frJelXwZ6hPD8K-HPi6HnyvCtBQinHO0vtbYbwqGrVsmemGGannQ-pfc19TuMoLqvCqyCabumi0j_pN4J5I8gkCz1aP-Fth1b2Gb46UaksHygVcamjZzGdt3n1BhzsQo73nmERjbsNdCWzcshXb3UTX0yQKefsLkVuftomKUVTR5pnzA_5Cks_0zeWJKDJTgF5pqdcPfFD4A"
    header = {"Authorization":'Bearer '+token,"X-RestLi-Protocol-Version":"2.0.0"}
    x = requests.get(url,headers = header)
    print("Successfully got LinkedIn Data for User {}".format(user))


def social_data(user):
    getLinkedIn_details(user)
    consumer_key = "gTqBz2LQ7JmD69evD7znu9eRI"
    consumer_secret =  "COpoNirngk5EzKljtpWmJxyNsciJcGDDbMAmIPexRqFr6P9m6C"
    access_token = "3354449539-MFBUjRIN2ZYQ1bCrhFzdpYvk7k4ZYmN6ihu1HGD"
    access_token_secret = "fl7YZTXQPjzgLLfwNPK2sIdQiVE7v8S7G3lkxIzQKUlcZ"
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    auth_api = API(auth)
    api = API(auth)
    target = user
    print("Getting Social data for User --> " + target)
    item = auth_api.get_user(target)
    social_profile_data = ""
    hashtags = ""
    for item in tweepy.Cursor(api.user_timeline,id=user).items():
        key = 'hashtags'
        dictionary = item._json
        for key, value in recursive_items(dictionary):
            if(key == 'hashtags' and len(value)>0):
                for i in range(len(value)):
                    hastag = "#"+str(value[i]['text'])
                    hashtags = hashtags + hastag + " "
        social_profile_data = social_profile_data + str(item._json['text'])
    print("Successfully got Social Report")
    return social_profile_data,hashtags

def visualizeHashTags(unique_id, hashtags):
    maskArray = np.array(Image.open("static/cloud.png"))
    cloud = WordCloud(background_color = "black", mask = maskArray, stopwords = set(STOPWORDS),width=500, height=500,contour_width=10, contour_color='white')
    cloud.generate(hashtags)
    print("Saving output with filename {}".format('static/' + unique_id+"_wordCloud.png"))
    cloud.to_file('static/' + unique_id+"_wordCloud.png")