import { Component } from '@angular/core';
import {
  IonicPage,
  NavParams,
  ViewController,
  NavController
} from 'ionic-angular';
import { FAQPage } from '../FAQ/FAQ';

/**
 * Generated class for the ModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-modal-page',
  templateUrl: 'modal-page.html'
})
export class ModalPage {
  data: {} = {};
  skills = [];
  constructor(
    private navParams: NavParams,
    private view: ViewController,
    public navCtrl: NavController
  ) {}

  ionViewWillLoad() {
    const data = this.navParams.get('data');
    this.data = data;
    this.skills = data.skills;
    console.log(data.skills.split(','));
    // alert(typeof data.skills.split(','));
  }

  closeModal() {
    this.view.dismiss();

    // this.navCtrl.push(FAQPage);
  }
}
