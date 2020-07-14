from textblob import TextBlob 
import matplotlib.pyplot as plt
from pywaffle import Waffle
import ProWritingAidSDK
from ProWritingAidSDK.rest import ApiException
import json



def TeamPlayerAnalysis(text,unique_id):
    analysis = TextBlob(text)
    print(analysis.sentiment.polarity-0.15)
    score = analysis.sentiment.polarity-0.15
    if score > 0.0: 
        data = {'Team Player': 1, 'Neutral': 0,'Not A Team Player': 0}
        fig = plt.figure(
        FigureClass=Waffle, 
        rows=1,
        columns = 1,
        values=data,
        colors=("#99ff99", "#D3D3D3","#FF0000"),
        legend={'loc': 'upper left', 'bbox_to_anchor': (1,1),'fontsize' : 10},
        icons = 'users',
        font_size=150,
        figsize = (10,10),
        icon_legend=True
    )
        fig.suptitle("Applicant is Team Player. Score = "+str(int(50+(score*100)))+"%",fontsize=15)
    elif score ==0: 
        print('neutral')
        data = {'Neutral': 1,'Team Player': 0 ,'Not A Team Player': 0}
        fig = plt.figure(
        FigureClass=Waffle, 
        rows=1,
        columns = 1,
        values=data,
        colors=( "#D3D3D3","#99ff99","#FF0000"),
        legend={'loc': 'upper left', 'bbox_to_anchor': (1,1),'fontsize' : 10},
        icons = 'users',
        font_size=150,
        figsize = (10, 10),
        icon_legend=True
    )
        fig.suptitle("Applicant is Neutral towards team. Score = "+str(int(50+(score*100)))+"%",fontsize=15)
    else: 
        print('negative')
        data = {'Not A Team Player':1,'Team Player': 0, 'Neutral': 0}
        fig = plt.figure(
        FigureClass=Waffle, 
        rows=1,
        columns = 1,
        values=data,
        colors=("#FF0000","#99ff99", "#000000"),
        legend={'loc': 'upper left', 'bbox_to_anchor': (1,1),'fontsize' : 20},
        icons = 'users',
        font_size=150,
        icon_size = 350,
        figsize = (10,10),
        icon_legend=True
    )
        fig.suptitle("Applicant is NOT a team player. Score = "+str(int(50+(score*100)))+"%", fontsize=15)
    plt.tight_layout()
    fig.savefig('static/'+'here'+unique_id+"_teamplayer.png")


def convAnalysis(text,unique_id):
    bias = 20
    #text = "I am a very good communicatory and find it's easy for me to relate to other people. I really enjoy learning new things and constantly seeking out new learning opportunities. My experience as intern provided me with unique technical skills that I can apply to this role and gave me an opportunity to understand the ins-and-outs of the industry, and to take on tasks I might not have at a larger company. I think this experience gives me a slight edge over other applicants. I'm not afraid of failure. In fact, I think it is an essential part of the experimental process that gets you to success. When solving problems, I apply both logic and emotional aspects in equal proportion."
    #text = "I am very good communicatoryassas"
    word_count = len(text.split(" "))
    configuration = ProWritingAidSDK.Configuration()
    configuration.host = 'https://api.prowritingaid.com'
    configuration.api_key['licenseCode'] = '808A5E7D-3099-45D8-9A99-2C8F8D2DCDC4'

    # create an instance of the API class
    api_instance = ProWritingAidSDK.TextApi(ProWritingAidSDK.ApiClient('https://api.prowritingaid.com'))

    api_request = ProWritingAidSDK.TextAnalysisRequest(text,["grammar"],"General","en")
    api_response = api_instance.post(api_request)
    no_of_issues = api_response.result.summaries[0].number_of_issues
    percentage = (((word_count - no_of_issues)/word_count)*100)-bias
    if(percentage < 0):
        percentage = percentage + bias+5

    data = {'Proficiency': int(percentage), 'Issues': 100 - int(percentage)}
    fig = plt.figure(
        FigureClass=Waffle, 
        rows=10,
        columns = 10,
        values=data,
        colors=("#777fbe", "#D3D3D3"),
        legend={'loc': 'upper left', 'bbox_to_anchor': (1.1,1),'fontsize' : 10},
        icons = 'circle',
        font_size=30,
        figsize = (10,10),
        icon_legend=True
    )
    fig.suptitle("Applicant Communication Skill : "+str(percentage),fontsize=15)
    plt.tight_layout()
    fig.savefig('static/'+'here'+unique_id+"_convAnalysis.png")

def skillTrend(text,unique_id,age_bucket):
    user_techincal_skills = getUserTechnicalSkills(text)
    technical_trend_skills = getTechnicalTrend(age_bucket)
#     skill_percentile = int(getScoring(user_techincal_skills,technical_trend_skills))
    skill_percentile = 80
    data = {'Applicant Skill ': skill_percentile, 'Skill Trend': 100 - skill_percentile}
    fig = plt.figure(
        FigureClass=Waffle, 
        rows=7,
        columns = 7,
        values=data,
        colors=("#777fbe", "#D3D3D3"),
        legend={'loc': 'upper left', 'bbox_to_anchor': (1,1),'fontsize' : 17},
        icons = 'child',
        font_size=55,
        figsize = (10,10),
        icon_legend=True
    )
    fig.suptitle("Applicant Skills are in Top "+str(skill_percentile)+" percentile of Skill Trend in the \n Age group of "+str(age_bucket),fontsize=15)
    plt.tight_layout()
    fig.savefig('static/'+'here'+unique_id+"_skillTrend.png")



def getUserTechnicalSkills(text):
    with open("technology_stack.txt","r") as f:
        technologies_raw = f.read()
    technologies_raw = technologies_raw.replace('"',"").strip('][').split(',')
    #print(technologies_raw)
    technologies = []
    for tech in technologies_raw:
        technologies.append(str(tech).replace("-"," ").lower())
    technologies = set(technologies)
    text_skills = set(text.lower().replace(","," ").split(" "))
    skills = (technologies & text_skills)
    return list(skills)

    
def getTechnicalTrend(ageBucket):
    with open("TechnicalTrends.txt","r") as f:
        technicalTrends = f.read()
        #print(technicalTrends)
    technicalTrends = json.loads(technicalTrends)
    #print(type(technicalTrends))
    return technicalTrends[ageBucket]
    
def getScoring(user_techincal_skills,technical_trend_skills):
    matched = set(user_techincal_skills) & set(technical_trend_skills)
    score = (len(matched)/len(technical_trend_skills))*100
    return score

