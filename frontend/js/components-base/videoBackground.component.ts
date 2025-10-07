import { auto } from '@popperjs/core';
import { DOMHelper } from '../utils/domHelper';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: any;
    YT: any;
  }
}

export default class VideoBackgroundComponent {
  private cssClasses = {
    videoBGWrapper: 'video-bg__wrapper relative isolate overflow-hidden',
    videoBGIframe: 'video-bg__iframe absolute top-0 left-0 w-full h-full -z-1 pointer-events-none',
  };

  constructor() {
    const videos = document.querySelectorAll('[data-video-bg]');
    Array.from(videos).forEach((video) => {
      this.initVideo(video as HTMLElement);
    });
  }

  private async initVideo(video: HTMLElement) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = document.getElementById(video.getAttribute('data-video-bg'));
    const controller = document.getElementById(video.getAttribute('data-video-controls'));

    const datasetKeys = Object.keys(video.dataset);
    datasetKeys.forEach((key) => {
      if (this.cssClasses[key]) {
        this.cssClasses[key] = video.dataset[key];
      }
    });

    if (!container || !video || !controller) {
      console.warn('Not all video elements are present');
      return;
    }
    if (video.hasAttribute('data-vimeo-id') && video.hasAttribute('aria-hidden')) {
      return;
    }
    video.setAttribute('aria-hidden', 'true');
    container.classList.add(...this.cssClasses.videoBGWrapper.split(' '));

    if (video.hasAttribute('data-youtube-id')) {
      const videoId = video.getAttribute('data-youtube-id');
      const youtubeApi = document.getElementById('youtubeAPI');
      if (!youtubeApi) {
        const tag = document.createElement('script');
        tag.id = 'youtubeAPI';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player(video, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            playsinline: 1,
            controls: 0,
            color: 'white',
            loop: 1,
            mute: 1,
            playlist: videoId,
          },
          events: {
            onReady: () => {
              if (prefersReducedMotion) {
                player.pauseVideo();
                controller.setAttribute('data-paused', 'true');
                controller.removeAttribute('data-playing');
              } else {
                player.playVideo();
                controller.setAttribute('data-playing', 'true');
                controller.removeAttribute('data-paused');
              }
              player.mute();

              controller.addEventListener('click', () => {
                if (controller.hasAttribute('data-playing')) {
                  player.pauseVideo();
                  controller.setAttribute('data-paused', 'true');
                  controller.removeAttribute('data-playing');
                } else {
                  player.playVideo();
                  controller.setAttribute('data-playing', 'true');
                  controller.removeAttribute('data-paused');
                }
              });
            },
            onError: (e) => {
              console.warn('YouTube API error', e);
            },
          },
        });
      };
      const iframe = container.querySelector('iframe');
      if (iframe) {
        iframe.classList.add(...this.cssClasses.videoBGIframe.split(' '));
      }
      this.initVideoRatio(video);
    }

    if (video.hasAttribute('data-vimeo-id')) {
      const videoId = video.getAttribute('data-vimeo-id');
      const VimeoModule = await import('@vimeo/player');
      const Vimeo = VimeoModule.default;

      const options = {
        background: true,
        autoplay: true,
        loop: true,
        muted: true,
      };
      const videoPlayer = new Vimeo(video, options);
      videoPlayer.on('loaded', () => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.classList.add(...this.cssClasses.videoBGIframe.split(' '));
        }
        this.initVideoRatio(video);
      });
      if (!controller.hasAttribute('data-playing') && !controller.hasAttribute('data-paused')) {
        controller.addEventListener('click', () => {
          if (controller.hasAttribute('data-playing')) {
            videoPlayer.pause();
            controller.setAttribute('data-paused', 'true');
            controller.removeAttribute('data-playing');
          } else {
            videoPlayer.play();
            controller.setAttribute('data-playing', 'true');
            controller.removeAttribute('data-paused');
          }
        });
      }
      if (prefersReducedMotion) {
        videoPlayer.pause();
        controller.setAttribute('data-paused', 'true');
        controller.removeAttribute('data-playing');
      } else {
        videoPlayer.play();
        controller.setAttribute('data-playing', 'true');
        controller.removeAttribute('data-paused');
      }
    }
  }

  private initVideoRatio(video: HTMLElement) {
    this.onResize(video);
    window.addEventListener('resize', () => {
      this.onResize(video);
    });
  }

  private onResize(video: HTMLElement) {
    const container = document.getElementById(video.getAttribute('data-video-bg'));
    let positionElement = video;
    if (video.tagName.toLowerCase() !== 'iframe') {
      positionElement = video.querySelector('iframe');
    }
    if (!container || !positionElement) {
      return;
    }
    positionElement.style.height = '';
    positionElement.style.width = `100%`;
    positionElement.style.transform = '';

    if (positionElement.clientWidth / 16 < positionElement.clientHeight / 9) {
      positionElement.style.height = `100%`;
      positionElement.style.width = `${Math.ceil((positionElement.clientHeight / 9) * 16)}px`;
      positionElement.style.transform = `translateX(${(container.clientWidth - positionElement.clientWidth) / 2}px)`;
    } else {
      positionElement.style.width = `100%`;
      positionElement.style.height = `${Math.ceil((positionElement.clientWidth / 16) * 9)}px`;
      positionElement.style.transform = `translateY(${(container.clientHeight - positionElement.clientHeight) / 2}px)`;
    }
  }
}
