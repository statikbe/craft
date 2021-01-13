import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

declare global {
  interface Window {
    onYouTubeIframeAPIReady: any;
    YT: any;
  }
}

export class VideoBackgroundComponent {
  constructor() {
    const videos = document.querySelectorAll(".js-video-bg");
    Array.from(videos).forEach((video) => {
      this.initVideo(video as HTMLElement);
    });

    const videoRatios = document.querySelectorAll(".js-video-container");
    Array.from(videoRatios).forEach((video) => {
      this.initVideoRatio(video as HTMLElement);
    });
  }

  private initVideo(video: HTMLElement) {
    //Idea from: https://unicorntears.dev/posts/how-to-implement-a-seamless-responsive-video-background-using-youtube-and-wordpress/
    // const parent = video.parentElement;
    const videoId = video.getAttribute("data-youtube-id");

    const youtubeApi = document.getElementById("youtubeAPI");
    if (!youtubeApi) {
      const tag = document.createElement("script");
      tag.id = "youtubeAPI";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
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
          color: "white",
          loop: 1,
          mute: 1,
          playlist: videoId,
        },
        events: {
          onReady: () => {
            player.playVideo();
            player.mute();
          },
        },
      });
    };
  }

  private initVideoRatio(video: HTMLElement) {
    const wrapper = video.querySelector(".js-video-wrapper") as HTMLElement;
    if (wrapper) {
      this.onResize(video, wrapper);
      window.addEventListener("resize", () => {
        this.onResize(video, wrapper);
      });
    }
  }

  private onResize(video: HTMLElement, wrapper: HTMLElement) {
    if (video.clientWidth / 16 < video.clientHeight / 9) {
      wrapper.style.width = `${Math.ceil(
        (((video.clientHeight / 9) * 16) / video.clientWidth) * 100
      )}%`;
      wrapper.style.paddingBottom = `${Math.ceil(
        (video.clientHeight / video.clientWidth) * 100
      )}%`;
    } else {
      wrapper.style.width = "";
      wrapper.style.paddingBottom = "";
    }
  }
}
