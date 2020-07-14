import { Component, Renderer, NgZone, NgModule } from '@angular/core';
import {
  NavController,
  LoadingController,
  AlertController,
  ModalController,
  Modal,
  ModalOptions
} from 'ionic-angular';
import { DataStore } from '../../app/dataStore';
import { LiveUpdateProvider } from '../../providers/live-update/live-update';
import { ChatPage } from '../chat/chat';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-Landing',
  templateUrl: 'Landing.html'
})
@NgModule({
  providers: [LiveUpdateProvider]
})
export class LandingPage {
  hubcards: {
    status_stage: string;
    jobTitle: string;
    description: string;
    score_skills: string;
    score_exp: string;
    score_github: string;
    score_academics: string;
  }[] = [];
  loading: any;

  constructor(
    private modal: ModalController,
    public navCtrl: NavController,
    public dataStore: DataStore,
    public liveUpdateService: LiveUpdateProvider,
    public loadingController: LoadingController,
    private alertCtrl: AlertController,
    public storage: Storage
  ) {}

  chat() {
    this.navCtrl.push(ChatPage);
  }

  showAlert() {
    const alert = this.alertCtrl.create({
      title: 'Failure',
      message: 'Looks like you have already applied for the job',
      buttons: [
        {
          text: 'Ok'
        }
      ]
    });
    alert.present();
  }

  openModal(hubCard) {
    const myModalOptions: ModalOptions = {
      enableBackdropDismiss: false
      // cssClass: 'mymodal'
    };

    const myModalData = hubCard;

    const myModal: Modal = this.modal.create(
      'ModalPage',
      { data: myModalData },
      myModalOptions
    );

    myModal.present();

    myModal.onDidDismiss(() => {
      console.log('I have dismissed.');
      // console.log(data);
    });

    myModal.onWillDismiss(() => {
      console.log("I'm about to dismiss");
      // console.log(data);
    });
  }

  // use it for navigation in hub pages
  navigateFromHubCard(
    jobTitle,
    score_skills,
    score_exp,
    score_github,
    score_academics
  ) {
    this.navCtrl.push(ChatPage, {
      jobTitle: jobTitle,
      score_skills: score_skills,
      score_exp: score_exp,
      score_github: score_github,
      score_academics: score_academics
    });
    // this.storage.get('jobs').then(val => {
    //   var appiledJobs: string[] = [];
    //   if (val !== null) {
    //     appiledJobs = val.split(',');
    //     if (appiledJobs.indexOf(jobTitle) == -1) {
    //       appiledJobs.push(jobTitle);
    //       this.storage.set('jobs', appiledJobs.toString());
    //       this.navCtrl.push(ChatPage, {
    //         jobTitle: jobTitle,
    //         score_skills: score_skills,
    //         score_exp: score_exp,
    //         score_github: score_github,
    //         score_academics: score_academics
    //       });
    //     } else {
    //       this.showAlert();
    //     }
    //   } else {
    //     appiledJobs.push(jobTitle);
    //     this.storage.set('jobs', appiledJobs.toString());
    //     this.navCtrl.push(ChatPage, {
    //       jobTitle: jobTitle,
    //       score_skills: score_skills,
    //       score_exp: score_exp,
    //       score_github: score_github,
    //       score_academics: score_academics
    //     });
    //   }
    // });
  }

  ionViewDidEnter() {
    this.loading = this.loadingController.create({
      content: 'Checking for jobs Please wait...'
    });
    this.loading.present();
    fetch('http://173.193.106.20:32327/jobs')
      .then(res => res.json())
      .then(data => {
        // alert(JSON.stringify(data));
        this.hubcards = data;
        this.loading.dismissAll();
      })
      .catch(error => {
        this.loading.dismissAll();
        alert('Error fetching jobs: ' + error);
      });
  }
}
