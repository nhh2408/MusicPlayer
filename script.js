const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "dustin-music";

const heading = $(".header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $(".progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const shufferBtn = $(".btn-shuffer");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isShuffer: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Ric Flair Drip",
      singer: "Offset",
      path: "./assets/music/Ric-Flair-Drip.mp4",
      image: "./assets/img/ricflairdrip.jpg",
    },
    {
      name: "I Don't Care",
      singer: "Ed Sheeran",
      path: "./assets/music/I-Don't-Care.mp4",
      image: "./assets/img/i-don't-care.jpg",
    },
    {
      name: "Ibiza",
      singer: "Tyga",
      path: "./assets/music/Ibiza.mp4",
      image: "./assets/img/lbiza.jpg",
    },
    {
      name: "Wake Up in The Sky",
      singer: "Bruno Mars",
      path: "./assets/music/Wake-Up-in-The-Sky.mp4",
      image: "./assets/img/wake-up-in-the-sky.jpg",
    },
    {
      name: "That's What I Like",
      singer: "Bruno Mars",
      path: "./assets/music/That’s-What-I-Like.mp4",
      image: "./assets/img/that's-what-i-like.jpg",
    },
    {
      name: "Flower",
      singer: "Johnny Stimson",
      path: "./assets/music/Flower.mp4",
      image: "./assets/img/flower.jpg",
    },
    {
      name: "You Belong With Me",
      singer: "Taylor Swift",
      path: "./assets/music/you-belong-with-me.mp4",
      image: "./assets/img/you-belong-with-me.jpg",
    },
    {
      name: "So Big",
      singer: "Iyaz",
      path: "./assets/music/So-Big.mp4",
      image: "./assets/img/so-big.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
        <div
          class="thumb"
          style="
            background-image: url('${song.image}');
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fa-regular fa-heart"></i>
          <i class="fa-solid fa-ellipsis"></i>
        </div>
      </div>
      `;
    });
    playList.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    // CD Rotate
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 30000,
      interations: Infinity,
    });
    cdThumbAnimate.pause();

    //Zoom In Zoom Out CD when scroll
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // click play button
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    audio.ontimeupdate = function () {
      const progressPercent = Math.floor(
        (audio.currentTime / audio.duration) * 100
      );
      progress.value = progressPercent;
    };

    progress.onchange = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };

    nextBtn.onclick = function () {
      if (_this.isShuffer) {
        _this.shufferSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    prevBtn.onclick = function () {
      if (_this.isShuffer) {
        _this.shufferSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    shufferBtn.onclick = function () {
      // Cach 1:
      // if (_this.isShuffer) {
      //   _this.isShuffer = false;
      //   shufferBtn.classList.remove("active");
      // } else {
      //   _this.isShuffer = true;
      //   shufferBtn.classList.add("active");
      // }

      // Cach 2:
      _this.isShuffer = !_this.isShuffer;
      _this.setConfig("isShuffer", _this.isShuffer);
      shufferBtn.classList.toggle("active", _this.isShuffer);
    };

    // Auto next when song end
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    playList.onclick = function (e) {
      const songElem = e.target.closest(".song:not(.active)");
      const optionElem = e.target.closest(".option");
      if (songElem || optionElem) {
        // xu ly when click on song
        if (songElem) {
          _this.currentIndex = Number(songElem.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // xu ly when click on option
        if (optionElem) {
        }
      }
    };
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  shufferSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.songs.length);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  scrollToActiveSong: function () {
    setTimeout(function () {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadConfig: function () {
    this.isShuffer = this.config.isShuffer;
    this.isRepeat = this.config.isRepeat;
  },
  start: function () {
    this.loadConfig();
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
    shufferBtn.classList.toggle("active", this.isShuffer);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
