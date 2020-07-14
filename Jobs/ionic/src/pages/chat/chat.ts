import { Component, Renderer, NgZone } from '@angular/core';
import {
  NavController,
  ModalController,
  Modal,
  ModalOptions,
  NavParams,
  AlertController,
  LoadingController
} from 'ionic-angular';
import { DataStore } from '../../app/dataStore';
import WatsonChat from '../../componentScripts/chat';
import { Platform } from 'ionic-angular';
import { ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FAQPage } from '../FAQ/FAQ';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
  jobTitle: string;
  filePath: string;
  fileName: string = '';
  messagesCount: number = 0;
  linkedInUserName: string = '';
  githubUserName: string = '';
  twitterUserName: string = '';
  question1: string = '';
  question2: string = '';
  question3: string = '';
  fileContents: any;
  loading: any;
  resume: string = 'yes';
  score_skills: string = '';
  score_exp: string = '';
  score_github: string = '';
  score_academics: string = '';

  constructor(
    private modal: ModalController,
    public loadingController: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public renderer: Renderer,
    public dataStore: DataStore,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    public platform: Platform,
    public elem: ElementRef,
    private filePicker: IOSFilePicker,
    private fileChooser: FileChooser
  ) {
    this.jobTitle = navParams.get('jobTitle');
    this.score_skills = navParams.get('score_skills');
    this.score_exp = navParams.get('score_exp');
    this.score_github = navParams.get('score_github');
    this.score_academics = navParams.get('score_academics');
    this.watsonChat.init(
      this.url,
      this.iam_apikey,
      this.workspaceId,
      eval('this.shouldSendWatsonAssistantAnalytics')
    );
    platform.ready().then(() => {
      this.message();
    });
  }

  messages = [];
  input: any;
  watsonChat = new WatsonChat();
  pageTagName: any;
  username = (this.dataStore as any).username || 'USER';

  showAlert() {
    const alert = this.alertCtrl.create({
      title: 'Success',
      message:
        'Your reponse has been submitted sucessfully. We will get back to you as soon as possible',
      buttons: [
        {
          text: 'Ok'
        }
      ]
    });
    alert.present();
  }

  public uploadFile(files: FileList) {
    let results = [];
    if (files && files.length > 0) {
      const file: File = files.item(0); //assuming only one file is uploaded
      this.fileName = file.name;
      this.watsonChat.sendMessage(this.messages, this.fileName, (err, msgs) => {
        this.zone.run(() => {
          this.messages = msgs;
          this.input = '';
        });
      });
      this.cdr.detectChanges();
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        this.fileContents = reader.result;
        // alert(this.fileContents);
      };
      reader.onerror = function(error) {
        alert('Error reading file ' + error);
      };
    }
  }

  openModal() {
    const myModalOptions: ModalOptions = {
      enableBackdropDismiss: false
      // cssClass: 'mymodal'
    };

    const myModalData = {
      name: 'Paul Halliday',
      occupation: 'Developer'
    };

    const myModal: Modal = this.modal.create(
      'ModalPage',
      { data: myModalData },
      myModalOptions
    );

    myModal.present();

    myModal.onDidDismiss(data => {
      console.log('I have dismissed.');
      console.log(data);
    });

    myModal.onWillDismiss(data => {
      console.log("I'm about to dismiss");
      console.log(data);
    });
  }

  message() {
    // alert(this.input.length + ' ' + this.messagesCount);
    // this.openModal();
    if (this.messagesCount == 1) {
      this.linkedInUserName = this.input;
    } else if (this.messagesCount == 2) {
      this.githubUserName = this.input;
    } else if (this.messagesCount == 3) {
      this.twitterUserName = this.input;
    } else if (this.messagesCount == 4) {
      // alert(this.input.length);
      if (this.input.length == 3) {
        //SUBMIT DATA
        // alert(this.input);
        this.submitData();
        return;
      } else {
      }
    } else if (this.messagesCount == 5) {
      this.question1 = this.input;
    } else if (this.messagesCount == 6) {
      this.question2 = this.input;
    } else if (this.messagesCount == 7) {
      this.question3 = this.input;
      this.submitData();
      return;
    }
    this.messagesCount = this.messagesCount + 1;
    this.watsonChat.sendMessage(this.messages, this.input, (err, msgs) => {
      this.zone.run(() => {
        // alert(JSON.stringify(msgs));
        // if (msgs.length >= 4) {
        //   msgs.shift();
        //   this.resume = 'false';
        // }
        this.messages = msgs;
        this.input = '';
      });
    });
    this.cdr.detectChanges();
  }

  submitData() {
    // this.messages = [];
    var applicationID = new Date().valueOf();
    this.loading = this.loadingController.create({
      content: 'Submitting your response...'
    });

    var formdata = new FormData();
    formdata.append('resume', this.fileContents);
    formdata.append('applicationId', applicationID.toString().trim());
    formdata.append('linkedInUserName', this.linkedInUserName.trim());
    formdata.append('githubUserName', this.githubUserName.trim());
    formdata.append('twitterUserName', this.twitterUserName.trim());
    formdata.append('jobTitle', this.jobTitle.trim());
    formdata.append('1', this.question1.trim());
    formdata.append('2', this.question2.trim());
    formdata.append('3', this.question3.trim());
    formdata.append('score_academics', this.score_academics.trim());
    formdata.append('score_skills', this.score_skills.trim());
    formdata.append('score_exp', this.score_exp.trim());
    formdata.append('score_github', this.score_github.trim());

    // alert(this.score_academics);

    var requestOptions = {
      method: 'POST',
      body: formdata
    };

    fetch('http://173.193.106.20:32327/submitData', requestOptions)
      .then(response => response.json())
      .then(result => {
        // alert(result);
        this.loading.dismissAll();
        this.showAlert();
        // this.navCtrl.pop();
        this.navCtrl.push(FAQPage, { applicationID: applicationID });
      })
      .catch(error => {
        this.loading.dismissAll();
        alert('error : ' + error);
        this.navCtrl.pop();
      });
  }

  ionViewDidLoad() {
    this.fileName = '';
    this.pageTagName = this.elem.nativeElement.tagName.toLowerCase();
    const scrollContentSelector = this.pageTagName + ' .scroll-content';
    const scrollElement: HTMLElement = document.querySelector(
      scrollContentSelector
    ) as HTMLElement;
    scrollElement.style.overflow = 'hidden';
    WL.Analytics.log(
      {
        fromPage: this.navCtrl.getPrevious(this.navCtrl.getActive()).name,
        toPage: this.navCtrl.getActive().name
      },
      'PageTransition '
    );
    WL.Analytics.send();
  }

  // provide the url, iam api key and workspace id
  url =
    'https://api.eu-gb.assistant.watson.cloud.ibm.com/instances/0c5bf2ee-f250-4afb-a6d1-9d37861b21f9';
  iam_apikey = 'ky048w1mn74l7wa55EeGnf6gn4XApNlDP1s3PffweYC-';
  workspaceId = 'fefb273e-ffe2-4d17-8712-a267aa8c9178';
  shouldSendWatsonAssistantAnalytics = false;
}
