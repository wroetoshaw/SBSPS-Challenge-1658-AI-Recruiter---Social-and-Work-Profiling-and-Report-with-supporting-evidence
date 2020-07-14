import { Component, Renderer, NgZone } from '@angular/core';
import {
  NavController,
  ModalController,
  LoadingController,
  AlertController
} from 'ionic-angular';
import { DataStore } from '../../app/dataStore';
import { ChatPage } from '../chat/chat';
import { Storage } from '@ionic/storage';
import { FAQPage } from '../FAQ/FAQ';

@Component({
  selector: 'page-CustomHome',
  templateUrl: 'CustomHome.html'
})
export class CustomHomePage {
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
    public loadingController: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public renderer: Renderer,
    public dataStore: DataStore,
    public storage: Storage
  ) {}

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

  // use it for navigation in hub pages
  navigateFromHubCard(
    jobTitle,
    score_skills,
    score_exp,
    score_github,
    score_academics
  ) {
    // this.navCtrl.push(ChatPage, {
    //   jobTitle: jobTitle,
    //   score_skills: score_skills,
    //   score_exp: score_exp,
    //   score_github: score_github,
    //   score_academics: score_academics
    // });
    this.storage.get('jobs').then(val => {
      var appiledJobs: string[] = [];
      if (val !== null) {
        appiledJobs = val.split(',');
        if (appiledJobs.indexOf(jobTitle) == -1) {
          appiledJobs.push(jobTitle);
          this.storage.set('jobs', appiledJobs.toString());
          this.navCtrl.push(ChatPage, {
            jobTitle: jobTitle,
            score_skills: score_skills,
            score_exp: score_exp,
            score_github: score_github,
            score_academics: score_academics
          });
        } else {
          this.showAlert();
        }
      } else {
        appiledJobs.push(jobTitle);
        this.storage.set('jobs', appiledJobs.toString());
        this.navCtrl.push(ChatPage, {
          jobTitle: jobTitle,
          score_skills: score_skills,
          score_exp: score_exp,
          score_github: score_github,
          score_academics: score_academics
        });
      }
    });
  }

  username = (this.dataStore as any).username || '';

  ionViewDidLoad() {}
}
