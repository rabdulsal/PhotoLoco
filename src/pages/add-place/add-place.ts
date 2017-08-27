import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  LoadingController,
  ToastController } from 'ionic-angular';
import { NgForm } from "@angular/forms";
import { SetLocationPage } from "../set-location/set-location";
import { Location } from "../../models/location";
import { Geolocation } from "@ionic-native/geolocation";
import { Camera } from '@ionic-native/camera';
import { PlacesService } from '../../services/places';
import { File } from '@ionic-native/file';

declare var cordova: any; // Declare variable availability at run-time; currently only available on device

@IonicPage()
@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  location: Location = {
    lat: 40.7624324,
    lng: -73.9759827
  };
  locationIsSet = false;
  imageUrl = "";

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private geolocation: Geolocation,
    private camera: Camera,
    private file: File,
    private placesSrvc: PlacesService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) {}

  onSubmit(form: NgForm) {
    this.placesSrvc.addPlace(
      form.value.title,
      form.value.description,
      this.location,
      this.imageUrl
    );
      form.reset();
      this.location = {
        lat: 40.7624324,
        lng: -73.9759827
      };
      this.imageUrl = '';
      this.locationIsSet = false;
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage,
      {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(
      data => {
        if (data) {
          this.location = data.location;
          this.locationIsSet = true;
        }
      }
    )
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location'
    });
    loader.present();
    this.geolocation.getCurrentPosition()
      .then((location) => {
        loader.dismiss();
      this.location.lat = location.coords.latitude;
      this.location.lng = location.coords.longitude;
      this.locationIsSet = true;
    }).catch((error) => {
      loader.dismiss();
      const toast = this.toastCtrl.create({
        message: 'Could not get location, please select manually!',
        duration: 2500
      });
      toast.present();
    });
  }

  onTakePhoto() {
    this.camera.getPicture({
      encodingType: 0, // JPEG which is Default
      correctOrientation: true
    })
      .then(
        imageData => {
          const currentName = imageData.replace(/^.*[\\\/]/, '');
          const path = imageData.replace(/[^\/]*$/, '');
          this.file.moveFile(path, currentName, cordova.file.dataDirectory, currentName)
            .then(
              data => {
                this.imageUrl = data.nativeURL;
                this.camera.cleanup();
                // this.file.removeFile(path, currentName); Alterantive file cleanup
              }
            )
            .catch(
              err => {
                this.imageUrl = '';
                const toast = this.toastCtrl.create({
                  message: 'Cound not save the image. Please try again.',
                  duration: 2500
                });
                toast.present();
                this.camera.cleanup(); // Remove image from temp storage
              }
            );
          this.imageUrl = imageData;
        }
      )
      .catch(
        err => {
          const toast = this.toastCtrl.create({
            message: 'Cound not save the image. Please try again.',
            duration: 2500
          });
          toast.present();
        }
      );
  }

}
