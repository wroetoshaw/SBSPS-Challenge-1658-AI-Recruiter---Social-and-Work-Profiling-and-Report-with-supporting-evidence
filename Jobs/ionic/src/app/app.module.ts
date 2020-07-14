import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { DataStore } from './dataStore';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LiveUpdateProvider } from '../providers/live-update/live-update';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CustomHomePage } from '../pages/CustomHome/CustomHome';
import { ChatPage } from '../pages/chat/chat';
import { IonicStorageModule } from '@ionic/storage';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FAQPage } from '../pages/FAQ/FAQ';
import { LandingPage } from "../pages/Landing/Landing";

@NgModule({
  declarations: [MyApp, HomePage, CustomHomePage, ChatPage, FAQPage,LandingPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage, CustomHomePage, ChatPage, FAQPage,LandingPage],
  providers: [
    StatusBar,
    SplashScreen,
    DataStore,
    IOSFilePicker,
    FileChooser,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    LiveUpdateProvider
  ]
})
export class AppModule {}
