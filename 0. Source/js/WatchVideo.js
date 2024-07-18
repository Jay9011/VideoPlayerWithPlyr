const videoManager = {
    videoElement: null,
    videoUrl: null,
    player: null,
    /**
     * 비동기 함수를 통해 비디오 플레이어 초기화
     * @param {string} videoElementId - 비디오 요소의 id
     * @param {string} videoSrc - 비디오 경로/주소
     * @param {Function} onEndCallback - 비디오 재생 종료 시 실행할 콜백 함수
     * @param {Array} controls - Plyr 컨트롤러 설정
     * @param {Object} speed - 비디오 속도 설정 { selected: 선택된 속오, options: [속도 옵션]}
     * @param {boolean} controllable - 비디오 컨트롤 가능 여부
     * @returns
     */
    init: async function (
        videoElementId,
        videoSrc,
        onEndCallback = null,
        controls = null,
        speed = { selected: 1, options: [1] },
        controllable = true) {

        this.videoElement = document.getElementById(videoElementId);

        if (!this.videoElement) {
            console.error('Video element를 찾을 수 없습니다.');
            return;
        }

        this.videoUrl = videoSrc;
        this.videoElement.controls = false;

        // 비디오 소스를 설정
        this.setVideoSources();

        // Plyr 라이브러리를 동적으로 import
        const { default: Plyr } = await import('/library/plyr/plyr.min.js');
        
        this.setupPlyr(controls, speed, onEndCallback, controllable);
    },
    /**
     * Plyr 플레이어 설정
     * @param {Array} controls - Plyr 컨트롤러 설정
     * @param {Object} speed - 비디오 속도 설정 { selected: 선택된 속도, options: [속도 옵션]}
     * @param {Function} onEndCallback - 비디오 재생 종료 시 실행할 콜백 함수
     * @param {boolean} controllable - 비디오 컨트롤 가능 여부
     * @returns
     */
    setupPlyr: function (controls, speed, onEndCallback, controllable) {
        if (typeof Plyr === 'undefined') {
            console.error('Plyr 라이브러리가 로드되지 않았습니다.');
            return;
        }

        this.player = new Plyr(this.videoElement, {
            // controls가 null이면 기본 컨트롤러 사용
            controls:  controls || ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        });

        // 기본 속도 설정
        this.player.on('ready', () => {
            this.player.speed = speed;
        });

        // controllable 매개변수에 따라 제어 비활성화
        if (!controllable) {
            this.disableControls();
        }

        // 비디오가 끝나면 콜백 함수 실행
        if (onEndCallback) {
            this.videoElement.addEventListener('ended', onEndCallback);
        }
    },
    /**
     * 비디오 컨트롤 비활성화(마우스 우클릭, seek바 조작, 키보드 컨트롤 등을 비활성화)
     */
    disableControls: function () {
        // 오른쪽 클릭 메뉴 비활성화
        this.videoElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // seek바 조작 막기
        const progress_bar = this.videoElement.closest('.plyr').querySelector('.plyr__progress__container');
        if (progress_bar) {
            progress_bar.style.pointerEvents = 'none';
            progress_bar.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
        }

        // 키보드 컨트롤 비활성화
        this.player.config.keyboard = {
            focused: false,
            global: false
        };
    },
    /**
     * 확장자를 통해 비디오 파일의 타입을 반환
     * @param {string} url - 비디오 파일의 URL(확장자 포함)
     * @returns {string} - 비디오 파일의 타입
     */
    getFileType: function (url) {
        const extension = url.split('.').pop().toLowerCase();
        const mimeTypes = {
            mp4: 'video/mp4',
            webm: 'video/webm',
            ogg: 'video/ogg',
            wmv: 'video/x-ms-wmv',
            avi: 'video/avi',
        };
        return mimeTypes[extension] || 'video/mp4'; // 기본값을 'video/mp4'로 설정
    },
    /**
     * 비디오 소스를 설정 (현재는 하나의 비디오 소스만 지원하며, 초기화시 자동으로 설정 됨)
     */
    setVideoSources: function () {
        // 새로운 소스 요소 추가
        const sourceElement = document.createElement('source');
        sourceElement.src = this.videoUrl;
        /**
         * 비디오 파일의 타입을 설정
         * 현재는 html5에서 지원하는 mp4, webm, ogg, wmv, avi를 자동 유추
         */
        // sourceElement.type = this.getFileType(this.videoUrl);
        this.videoElement.appendChild(sourceElement);
    },
    /**
     * 비디오 재생
     */
    playVideo: function () {
        this.player.play();
    }
}
