import bs4
import dash
import string
from helper_modules import *
from bs4 import BeautifulSoup
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output, State
from chatbot_conv_analysis import TeamPlayerAnalysis, convAnalysis, skillTrend
from social_report import social_data, connect, gettingInsights, visualize, visualizeHashTags


def getJobs(cos, bucket_name):
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

    return item_names


def toggle_status(cos, bucket_name, applicationid):

    x = '{ "status":"working"}'
    
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
    print("Current status:", response['shortlisted'])
    if response['shortlisted'] == 'YES':
        response['shortlisted'] = 'NO'
    else:
        response['shortlisted'] = 'YES'
    cos_response = cos.Object(bucket_name, response["applicationId"] + ".json").put(Body=json.dumps(response))
    print("After:", response['shortlisted'])
    # COS status
    status_code = cos_response["ResponseMetadata"].get("HTTPStatusCode")
    if status_code != 200:
        print("Failed to Add Job! Try again")

    return


def main(unique_id, file_path, username, password, to_search_username, server, name, cos, bucket_name, dataJson, twitter_username):

    ### Initialize Global Space 
    global_init(file_path=file_path, 
                username=username,
                to_search_username=to_search_username,
                password=password,
                unique_id = unique_id
            )


    ################### Resume Parsing ####################
    print("***********Starting Resume Parsing***********")
    ### 1. Skills (Overall & Project based)
    # Data from Resume Parsing
    data_resume = ResumeParser(file_path).get_extracted_data()

    # Data from Project Section
    data_project, analysed_projects = get_section_wise(section="PROJECTS", file_path=file_path)

    skill_text, overall_skills, project_skills = generate_skills_text(data_resume['skills'], analysed_projects['skills'])
    wordcloud_generation(skill_text, overall_skills, project_skills, unique_id, '_wordcloud_skills')

    ### 2. Work Experience
    # Get Work Experience
    exp_content, analysed_exp = get_section_wise(section="EXPERIENCE", file_path=file_path)

    # Get months of work experience
    exp_in_months = cal_experience(exp_content)
    print("Total Work Experience", sum(exp_in_months), "months")

    # Get Project related Exp
    exp_in_months_projects = cal_experience(data_project)
    print("Total Project Experience", sum(exp_in_months_projects), "months")

    labels = ['Work Experience','Personal Project Experience']
    values = [sum(exp_in_months), sum(exp_in_months_projects)]
    
    fig_experience = pie_chart(labels, values)


    ### 3. Contact Details
    contact_details = { x: data_resume[x] for x in ['name', 'email', 'mobile_number'] }
    contact_df = pd.DataFrame({'Contact Type':["Name", "E-mail", "Phone"], 'Details':list(contact_details.values())})
    contact_df.to_html(unique_id + "_contact_table.html")


    ### 4. Academics
    # Get Academic related text
    educ_content, analysed_educ = get_section_wise(section="EDUCATION", file_path=file_path)

    percentages = list()
    # Find percentages in each degree
    for each_string in educ_content:
        if any([ele for ele in ['percentage', 'cgpa', '%'] if (ele in each_string.lower())]):
            temp = float(re.findall("\d+\.\d+", each_string)[0])
            if temp<10:
                temp *= 10
            percentages.append(int(round(temp,0)))
    fig_academics = plot_lines(['-', 'Class 10', 'Diploma', 'Undergraduation'], list(reversed(percentages)))


    ### 5. Top Achievements
    # Get Achievements related text
    achv_content, analysed_achv = get_section_wise("ACHIEVEMENTS", file_path)

    # Get Keyords and Relevance Scores
    k, v = get_keywords_nlu(['\n'.join(achv_content[1:])])
    k = list(chain(*k))
    v = list(chain(*v))

    # Match Keywords, score the relevance
    top_achv = defaultdict(int)
    for word, value in zip(k,v):
        for sentence in achv_content[1:]:
            if word in sentence:
                top_achv[sentence] += value
                break
    # Find top 3 Achievements        
    top_achv = {v: k for k, v in top_achv.items()}
    top_achv = [top_achv[x] for x in sorted(list(top_achv.keys()), reverse=True)[:3]]
    print("Top 3 Achievements are:", top_achv)


    ### 6. Keyword Matching
    nlp = spacy.load('en_core_web_sm')
    skills = list(overall_skills) + list(project_skills)
    given_skills = ['mysql', 'python', 'machine learning']

    present = list()
    for req in given_skills:
        for check in skills:
            if similarity(req, check, nlp) > 0.9:
                present.append(1)
    skill_score = round(sum(present)/len(given_skills), 1)
    print("Skills Score:", (sum(present)/len(given_skills)))
    # fig_skill_score_ = plotly_barchart(x=[0], 
    #                     y=[sum(present)/len(given_skills)], 
    #                     title="Skills Score:" + str(sum(present)/len(given_skills)), 
    #                     xaxis_title="Score", 
    #                     yaxis_title="Max Score",
    #                     tickvals=[0],
    #                     ticktext=['0'],
    #                     ytickvals=[0, 0.5, 1],
    #                     width=[0.8])

    ### 7. Suggest another Job
    all_jobs = getJobs(cos, bucket_name)
    given_skills = list()
    given_titles = list()
    for job in all_jobs:
        try:
            given_skills.append(job['skills'])
            given_titles.append(job['jobTitle'])
        except KeyError:
            continue
    # print("JOBS, Skills", given_skills, given_titles)
    nlp = spacy.load('en_core_web_sm')
    skills = list(overall_skills) + list(project_skills)
    # given_skills = [['mysql', 'python', 'machine learning', 'statistics', 'keras', 'flask', 'seaborn', 'hadoop', 'pyspark', 'tensorflow'], 
    #                 ['mysql', 'python', 'machine learning', 'statistics', 'keras', 'flask'],
    #                 ['mysql', 'python',],
    #                 ['mysql', 'python', 'machine learning', 'keras', 'html', 'css'], 
    #                 ['html', 'css', 'javascript', 'pyspark', 'react native']
    #             ]

    present = list()
    for _ in given_skills:
        temp = list()
        for req in _:
            for check in skills:
                if similarity(req, check, nlp) > 0.8:
    #                 print(req, check, similarity(req, check, nlp))
                    temp.append(1)
                    break
        present.append(temp)
    # print("presetn", present)            
    skill_scores = list()
    for temp, temp2 in zip(present, given_skills):
        skill_scores.append(sum(temp)/len(temp2))
    print("Skill Scores:", skill_scores)
    max_score_loc = skill_scores.index(max(skill_scores))
    if skill_scores[max_score_loc] < 0.5:
        relevant_job = 'No relevant jobs found'
    else:
        relevant_job = given_titles[max_score_loc]
    print("Relevant JOB: ", relevant_job)
    print("***********End of Resume Parsing***********")

    #################### Resume Validations ####################

    print("***********Starting Resume Validations***********")
    #### Get GitHub Projects
    names, desc = get_repos(to_search_username)

    # Data from Project Section
    data_project, analysed_projects = get_section_wise(section="PROJECTS", file_path=file_path)
    indices = [i for i, x in enumerate(data_project[1:]) if x == ""]
    titles = [data_project[1:][x] for x in [0] + list(np.array(indices)+1)]
    titles = preprocess_title(titles)

    projects_found = match_titles(names, titles, desc, to_search_username)
    evidence_found = len([x for x in projects_found if x is not None])/len(titles)
    print("Projects Evidence:", evidence_found)
    fig_evidence = plot_pie_validation(evidence_found, 1-evidence_found)


    #################### Work Profile ####################

    print("***********Starting Work Profile Analysis***********")
    number_of_commits = get_github_data(username, password, to_search_username)
    repos, commits = get_dataframes(to_search_username)

    fig_commit = plotly_barchart(x=repos['Name'], 
                        y=repos['Commits count'], 
                        title="Commits per Repository", 
                        xaxis_title="", 
                        yaxis_title="# of Commits",
                        tickvals=None,
                        ticktext=None
                        )

    commits['Year'] = commits['Date'].apply(lambda x: x.split('-')[0])
    yearly_stats = commits.groupby('Year').count()['Commit Id']

    fig_year = plotly_barchart(x=yearly_stats.index, 
                        y=yearly_stats.values, 
                        title="Commits per Year", 
                        xaxis_title="Year", 
                        yaxis_title="Commits",
                        tickvals=list(yearly_stats.index),
                        ticktext=None
                        )

    commits['Month'] = commits['Date'].apply(lambda x: x.split('-')[1])
    monthly_stats = commits.groupby('Month').count()['Commit Id']

    month_mapper = { '01': 'January', '02': 'February', '03': 'March', '04': 'April', 
                    '05': 'May', '06': 'June', '07': 'July', '08': 'August', 
                    '09': 'September', '10': 'October', '11': 'November', '12': 'December'}
    labels = []
    for value in monthly_stats.index:
        labels.append(month_mapper[value])

    fig_month = plotly_barchart(x=monthly_stats.index, 
                        y=monthly_stats.values, 
                        title="Commits per Month", 
                        xaxis_title="Month - Irrespective of Year", 
                        yaxis_title="# of Commits",
                        tickvals=list(monthly_stats.index),
                        ticktext=labels
                        )

    list_of_languages = []
    for languages in repos['Languages']:
        if type(languages) == str:
            for language in languages.split(','):
                list_of_languages.append(language.strip())
    languages_count = pd.Series(list_of_languages).value_counts()

    fig_lang = plotly_barchart(x=languages_count.index, 
                        y=languages_count.values, 
                        title="Language Distribution", 
                        xaxis_title="Language", 
                        yaxis_title="# of Repositories",
                        tickvals=list(languages_count.index),
                        ticktext=None
                        )

    data = commits.groupby(['Year', 'Month']).count()['Commit Id'].reset_index()

    fig_heatmap = go.Figure(data=go.Heatmap(
        x = data['Month'].values,
        y = data['Year'].values,
        z = data['Commit Id'].values
    ))
    fig_heatmap.update_layout(
        title_text="Month-wise distribution of Commits", 
        title_x=0.5,
        xaxis_title="Months",
        yaxis_title="Years",
    )
    fig_heatmap.update_yaxes(
        tickvals=data['Year'].values,
    )
    fig_heatmap.update_xaxes(
        tickvals=list(range(1, 13)),
        ticktext=list(map(str, list(range(1, 13)))),
    )

    print("***********End of Work Profile Analysis***********")

    ### Aggregating some text related values
    table_name = contact_details['name']
    table_email = contact_details['email']
    table_phone = str(contact_details['mobile_number'])
    table_user = to_search_username
    table_ach_1 = top_achv[0]
    table_ach_2 = top_achv[1]
    table_ach_3 = top_achv[2]
    table_job = relevant_job
    table_skill_score = str(skill_score)
    table_overall_score = str(skill_score)  

    ### Shortlisted or NOT. OVERALL SCORING 
    # overall_score ---> Skills Score, # of Commits, Academics, Work Experience, Project Experience
    # overall_score = 1
    # overall_score = (skill_score + 
    #                 number_of_commits/300 + 
    #                 (sum(percentages)/300) + 
    #                 (sum(exp_in_months)+sum(exp_in_months_projects))/30)/4
    overall_score = ( 
        (
            skill_score * int(dataJson['score_skills'])/100
        ) + 
        (
            (number_of_commits/300) * int(dataJson['score_github'])/100
        ) + 
        (
            (sum(percentages)/300) * int(dataJson['score_academics'])/100
        ) + 
        (
            ((sum(exp_in_months)+sum(exp_in_months_projects))/30) * int(dataJson['score_exp'])/100
        )
    )/2
    print("Scores:", skill_score * int(dataJson['score_skills'])/100, (number_of_commits/300) * int(dataJson['score_github'])/100,
    (sum(percentages)/300) * int(dataJson['score_academics'])/100, ((sum(exp_in_months)+sum(exp_in_months_projects))/30) * (int(dataJson['score_exp'])/100),
    overall_score)
    overall_score = min(1, overall_score)
    # print("SHORTLISTED: STATUS", skill_score, number_of_commits/300, (sum(percentages)/300), 
                # (sum(exp_in_months)+sum(exp_in_months_projects))/30, overall_score)
    if overall_score >= 0.5:
        shortlisted = "YES"
    else:
        shortlisted = "NO"

    # Graphs for Scores
    get_donut(skill_score, unique_id, '_table_skill_score')
    get_donut(overall_score, unique_id, '_table_overall_score')


    ### Saving Files
    # plt_skills.savefig('static/' + unique_id + '_wordcloud_skills.png', dpi=300)
    # table_skill_score.savefig('static/' + unique_id + '_table_skill_score.png', dpi=300)
    # table_overall_score.savefig('static/' + unique_id + '_table_overall_score.png', dpi=300)
    with open(unique_id + '_fig_experience.html', 'w') as f:
            f.write(fig_experience.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_academics.html', 'w') as f:
            f.write(fig_academics.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_evidence.html', 'w') as f:
            f.write(fig_evidence.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_commit.html', 'w') as f:
            f.write(fig_commit.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_year.html', 'w') as f:
            f.write(fig_year.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_month.html', 'w') as f:
            f.write(fig_month.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_lang.html', 'w') as f:
            f.write(fig_lang.to_html(full_html=False, include_plotlyjs='cdn'))
    with open(unique_id + '_fig_heatmap.html', 'w') as f:
            f.write(fig_heatmap.to_html(full_html=False, include_plotlyjs='cdn'))
    print("Saved FILES!")

    ## Visualization
    # plt_skills.show()
    # fig_experience.show()
    # fig_academics.show()
    # fig_evidence.show()
    # fig_commit.show()
    # fig_year.show()
    # fig_month.show()
    # fig_lang.show()
    # fig_heatmap.show()
    # print("Visualizations Complete!")

    #################### Social Profile Analysis ####################
    print("***********Starting of Social Profile Analysis***********")
    social_profile_data,hashtags = social_data(twitter_username)
    service = connect()
    profile = gettingInsights(social_profile_data, service, twitter_username)
    visualize(profile, unique_id)
    visualizeHashTags(unique_id, hashtags)
    print("***********End of Social Profile Analysis***********")


    #################### Chatbot Converstation Analysis ####################
    print("***********Starting of Chatbot Conv. Analysis***********")
    data = educ_content
    data = [x for x in data if 'university' in x.lower().translate(str.maketrans('', '', string.punctuation)).split() \
                                 or 'college' in x.lower().translate(str.maketrans('', '', string.punctuation)).split() \
                                    or 'school' in x.lower().translate(str.maketrans('', '', string.punctuation)).split()]
    age_group = get_age_group(' '.join(data))

    TeamPlayerAnalysis(dataJson["3"], unique_id)
    
    convAnalysis(dataJson['1']+" "+dataJson['2']+" "+dataJson['3'], unique_id)

    skillTrend(dataJson["2"], unique_id, age_group)
    print("***********End of Chatbot Conv. Analysis***********")

    #################### Dash Instances ####################
    # app_1 = dash.Dash(name, server=server, url_base_pathname='/dash/' + unique_id + '/')
    # app_1.layout = html.Div([
    #     dcc.Graph(figure=fig_experience)
    # ])

    # extenal_stylesheets = ['https://codepen.io/nikhiljsk/pen/OJMzJrj.css']
    # app = dash.Dash(name, server=server, url_base_pathname='/dash/' + unique_id + '/', external_stylesheets=extenal_stylesheets)
    # app.layout = html.Div([``
    #     html.Div(html.Img(src='/static/' + unique_id + '_wordcloud_skills.png', className="skill_image"), className='item1'),
    #     html.Div(dcc.Graph(figure=fig_experience), className='item2'),
    #     html.Div(dcc.Graph(figure=fig_academics), className='item3'),
    #     html.Div(dcc.Graph(figure=fig_evidence), className='item4'),
    # ], className="grid-container")

    with open('dash_layout_2.html', 'r') as file:
        layout = file.read()
    mainSoup = BeautifulSoup(layout)

    ## Text
    # text_to_read = ["table_name", "table_email", "table_phone", "table_user", "table_ach_1", 
    # "table_ach_2", "table_ach_3", "table_job", "table_skill_score", "table_overall_score"  ]
    text_to_read = ["table_name", "table_email", "table_phone", "table_user", "table_ach_1", 
    "table_ach_2", "table_ach_3", "table_job"]

    for text in text_to_read:
        extraSoup = BeautifulSoup(locals()[text])
        tag = mainSoup.find(class_=text)
        tag.insert(1, extraSoup.p)

    ## Plotly layouts
    file_to_read = ['fig_experience', 'fig_evidence', 'fig_academics',
                'fig_commit', 'fig_year', 'fig_month', 'fig_lang', 'fig_heatmap', 
                'fig_persona', 'fig_areaOfImp', 'fig_values']

    for file in file_to_read:
        # Get HTML
        with open(unique_id + '_' + file + '.html', 'r') as f:
            mini_layout = f.read()
            
        extraSoup = BeautifulSoup(mini_layout)
        tag = mainSoup.find(class_=file)
        tag.insert(1, extraSoup.div)

    ## Links
    projects_found = [x for x in projects_found if x is not None]
    for i in range(len(projects_found)):
        extraSoup = BeautifulSoup("""
                                    <a href={0} target="_blank" style="padding: 3px">{1}</a>
                                """.format(projects_found[i], len(projects_found)-i)
                                )
        tag = mainSoup.find(class_="link_proj_url")
        tag.insert(0, extraSoup.a)
        
    ## Images 
    # image_to_read = ['wordcloud_skills', "table_overall_score", "table_skill_score"]
    img = "teamplayer"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:400px;height:400px;">
                                """.format("/static/" +'here' + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)

    img = "convAnalysis"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:400px;height:400px;">
                                """.format("/static/" +'here' + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)

    img = "skillTrend"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:400px;height:400px;">
                                """.format("/static/" +'here' + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)

    img = "wordCloud"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:400px;height:400px;">
                                """.format("/static/" + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)


    img = "table_skill_score"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:300px;height:300px;margin-left:30px">
                                """.format("/static/" + 'ere' + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)

    img = "table_overall_score"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:300px;height:300px;margin-left:30px">
                                """.format("/static/" + 'ere' + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)

    img = "wordcloud_skills"
    extraSoup = BeautifulSoup("""
                                <img src={0} style="width:500px;height:500px;">
                                """.format("/static/" + 'here' + unique_id + '_' + img + '.png'))
    print("/static/", extraSoup.img)
    tag = mainSoup.find(class_=img)
    tag.insert(1, extraSoup.img)
    # image_to_read = ['wordcloud_skills', "table_overall_score", "table_skill_score"]
    # for img in image_to_read:
    #     extraSoup = BeautifulSoup("""
    #                                 <img src={0} style="width:500px;height:500px;">
    #                                 """.format("/static/" + unique_id + '_' + img + '.png'))
    #     print("/static/" + unique_id + '_' + img + '.png')
    #     tag = mainSoup.find(class_=img)
    #     tag.insert(1, extraSoup.img)

    # app = dash.Dash(__name__, index_string=str(mainSoup))
    app_1 = dash.Dash(name, server=server, url_base_pathname='/dash/' + unique_id + '/', index_string=str(mainSoup))

    # Update Layout
    app_1.layout = html.Div([
        html.Button(children='Toggle Shortlist Status', 
                className="btn btn-lg btn-block final_button",
                n_clicks=0,
                id='submit-button-state',
                style={'color': 'white'}
                ),
        html.Div(id='output-state')
        ],) 

    @app_1.callback(Output('output-state', 'children'), [Input('submit-button-state', 'n_clicks')])
    def update_output(n_clicks):
        if n_clicks > 0:
            print(cos)
            toggle_status(cos, bucket_name, unique_id)
            return '''Status has been toggled!'''
        return ""

    print("Analysis Done for", unique_id)
    
    #################### Update COS Status ####################
    result_json = dataJson
    result_json['is_analysed'] = True
    result_json['shortlisted'] = shortlisted
    result_json['overall_score'] = overall_score
    result_json['relevant_job'] = relevant_job
    cos_response = cos.Object(bucket_name, unique_id + ".json").put(
                        Body=json.dumps(result_json)
                    )
    # COS status
    status_code = cos_response["ResponseMetadata"].get("HTTPStatusCode")
    if status_code != 200:
        print("*********** !!! FAILED to update status in COS !!! ***********")
                    
    print("Analysed Data. Created Dash Instance. Saved data in COS!")             
    return 