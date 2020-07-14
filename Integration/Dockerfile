FROM python:3.6-slim
WORKDIR /app
COPY . ./
RUN apt-get update && apt-get install -y git
RUN python3.6 -m pip install -r requirements.txt
RUN python3.6 -m nltk.downloader stopwords
RUN python3.6 -m spacy download en_core_web_sm
RUN python3.6 -m spacy download en
# RUN chmod +x terminal_installation.sh
# RUN terminal_installation.sh
CMD ["python3.6", "server.py"]
