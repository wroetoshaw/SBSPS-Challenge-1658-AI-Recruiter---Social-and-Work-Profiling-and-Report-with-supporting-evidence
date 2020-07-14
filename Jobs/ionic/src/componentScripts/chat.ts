export default class WatsonChat {
    url: string;
    iam_apikey: string;
    workspaceId: string;
    shouldSendAnalytics: boolean;

    init(url, iam_apikey, workspaceId, shouldSendAnalytics = false) {
        this.url = url;
        this.iam_apikey = iam_apikey;
        this.workspaceId = workspaceId;
        this.shouldSendAnalytics = shouldSendAnalytics;
    }

    sendMessage(messages = [], input, callback) {
        if (input && input.length > 0) {
            var obj = {};
            obj["workspace_id"] = this.workspaceId;
            if (input) {
                let timeNowInputMsg = new Date().toLocaleTimeString();
                timeNowInputMsg = timeNowInputMsg.substr(0, timeNowInputMsg.lastIndexOf(':'));
                const inputMsgTime = convertTimeToAMPM(timeNowInputMsg);
                input = input.replace(/(\r\n|\n|\r)/gm, "");
                messages.push(Object.assign({}, { m: input, isWatson: false, time: inputMsgTime }));
                obj["input"] = { text: input };
            }

            (<any>window).cordova.plugin.http.useBasicAuth("apikey", this.iam_apikey);
            (<any>window).cordova.plugin.http.setDataSerializer("json");
            (<any>window).cordova.plugin.http.post(
                `${this.url}/v1/workspaces/${
                this.workspaceId
                }/message?version=2018-09-20`,
                obj,
                null,
                res => {
                    const responseData = JSON.parse(res.data);
                    const msg = responseData.output.text[0];
                    // get timestamp of msg
                    let timeNow = new Date().toLocaleTimeString();
                    timeNow = timeNow.substr(0, timeNow.lastIndexOf(':'));
                    const msgTime = convertTimeToAMPM(timeNow);

                    if (this.shouldSendAnalytics) {
                        this.sendBotAnalytics(responseData);
                    }

                    if (msg && msg.length !== 0) {
                        messages.push(Object.assign({}, { m: msg, isWatson: true, time: msgTime }));
                    } else {
                        messages.push(
                            Object.assign(
                                {},
                                { m: " didn't understand can you try again", isWatson: true, time: msgTime }
                            )
                        );
                    }
                    return callback(null, messages);
                },
                err => {
                    alert("error " + err);
                    // get timestamp of msg
                    let timeNow = new Date().toLocaleTimeString();
                    timeNow = timeNow.substr(0, timeNow.lastIndexOf(':'));
                    const msgTime = convertTimeToAMPM(timeNow);
                    messages.push(
                        Object.assign(
                            {},
                            { m: "Bot is out of service! Try again later!", isWatson: true, time: msgTime }
                        )
                    );
                    return callback(null, messages);
                }
            );
        }
    }

    sendBotAnalytics(responseData) {
        if (responseData.intents && responseData.intents.length > 0) {
            responseData.intents.map(singleIntent => {
                WL.Analytics.log({ 'Chat-Intents': singleIntent.intent }, "BotAnalytics");
                const intentConfidence = {};
                intentConfidence[`intent:${singleIntent.intent}`] = singleIntent.confidence;
                WL.Analytics.log(intentConfidence, 'IntentAnalytics');
            });
        }

        WL.Analytics.send();
    }
}

function convertTimeToAMPM(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
        time = time.slice(1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
}
