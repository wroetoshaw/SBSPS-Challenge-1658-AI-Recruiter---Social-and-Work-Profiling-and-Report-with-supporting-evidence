import { Component, Renderer, NgZone, NgModule } from '@angular/core';
import {
  NavController,
  ModalController,
  LoadingController,
  NavParams
} from 'ionic-angular';
import { DataStore } from '../../app/dataStore';
import { LiveUpdateProvider } from '../../providers/live-update/live-update';
import { LandingPage } from '../Landing/Landing';

@Component({
  selector: 'page-FAQ',
  templateUrl: 'FAQ.html'
})
@NgModule({
  providers: [LiveUpdateProvider]
})
export class FAQPage {
  items = [
    {
      name: 'Estimated Time of application decision?',
      description:
        'It usually takes 2-3 working inorder for us to process the application',
      active: false
    },
    {
      name: 'Work Culture in Company?',
      description:
        "In our company, you can invent things you've never thought possible, lead in this new era of technology, and solve some of the world's most challenging problems",
      active: false
    },
    {
      name: 'Work Life Balance in the company?',
      description:
        'In our company job is more than just work. You get flexible work environment and hours. You can work from home any day',
      active: false
    }
  ];

  statusActive = false;
  statusJobs = false;
  applicationId = '';
  applicationStatus = '';
  relevantJob = '';
  loading = '';
  loadingJob = '';

  constructor(
    public navCtrl: NavController,
    public dataStore: DataStore,
    public liveUpdateService: LiveUpdateProvider,
    public loadingController: LoadingController,
    public navParams: NavParams
  ) {
    this.applicationId = navParams.get('applicationID');
  }

  ionViewDidLoad() {}

  goBack() {
    this.navCtrl.push(LandingPage);
  }

  toggleClass(item) {
    item.active = !item.active;
  }

  checkStatus() {
    this.applicationStatus = '';
    this.loading = 'yes';
    var formdata = new FormData();
    formdata.append('applicationId', this.applicationId);

    var requestOptions = {
      method: 'POST',
      body: formdata
    };

    fetch('http://173.193.106.20:32327/getStatus', requestOptions)
      .then(response => response.json())
      .then(result => {
        this.loading = '';
        this.applicationStatus = result.response;
      })
      .catch(error => {
        this.loading = '';
        console.log('error', error);
      });
  }

  checkJobs() {
    this.relevantJob = '';
    this.loadingJob = 'yes';
    var formdata = new FormData();
    formdata.append('applicationId', this.applicationId);

    var requestOptions = {
      method: 'POST',
      body: formdata
    };

    fetch('http://173.193.106.20:32327/getRelevantJob', requestOptions)
      .then(response => response.json())
      .then(result => {
        this.loadingJob = '';
        this.relevantJob = result.response;
      })
      .catch(error => {
        this.loadingJob = '';
        console.log('error', error);
      });
  }

  toggleClassStatus() {
    this.statusActive = !this.statusActive;
    this.applicationStatus = '';
  }

  toggleClassjobs() {
    this.statusJobs = !this.statusJobs;
    this.relevantJob = '';
  }
}
