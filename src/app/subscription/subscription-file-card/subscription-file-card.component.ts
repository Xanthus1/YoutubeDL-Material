import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { PostsService } from 'app/posts.services';

@Component({
  selector: 'app-subscription-file-card',
  templateUrl: './subscription-file-card.component.html',
  styleUrls: ['./subscription-file-card.component.scss']
})
export class SubscriptionFileCardComponent implements OnInit {
  image_errored = false;
  image_loaded = false;

  scrollSubject;
  scrollAndLoad;

  formattedDuration = null;

  @Input() file;
  @Input() sub;
  @Input() use_youtubedl_archive = false;

  @Output() goToFileEmit = new EventEmitter<any>();
  @Output() reloadSubscription = new EventEmitter<boolean>();

  constructor(private snackBar: MatSnackBar, private postsService: PostsService) {
    this.scrollSubject = new Subject();
    this.scrollAndLoad = Observable.merge(
      Observable.fromEvent(window, 'scroll'),
      this.scrollSubject
    );
  }

  ngOnInit() {
    if (this.file.duration) {
      this.formattedDuration = fancyTimeFormat(this.file.duration);
    }
  }

  onImgError(event) {
    this.image_errored = true;
  }

  onHoverResponse() {
    this.scrollSubject.next();
  }

  imageLoaded(loaded) {
    this.image_loaded = true;
  }

  goToFile() {
    this.goToFileEmit.emit(this.file.id);
  }

  deleteAndRedownload() {
    this.postsService.deleteSubscriptionFile(this.sub, this.file.id, false).subscribe(res => {
      this.reloadSubscription.emit(true);
      this.openSnackBar(`Successfully deleted file: '${this.file.id}'`, 'Dismiss.');
    });
  }

  deleteForever() {
    this.postsService.deleteSubscriptionFile(this.sub, this.file.id, true).subscribe(res => {
      this.reloadSubscription.emit(true);
      this.openSnackBar(`Successfully deleted file: '${this.file.id}'`, 'Dismiss.');
    });
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

}

function fancyTimeFormat(time)
{
    // Hours, minutes and seconds
    const hrs = ~~(time / 3600);
    const mins = ~~((time % 3600) / 60);
    const secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = '';

    if (hrs > 0) {
        ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }

    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;
    return ret;
}