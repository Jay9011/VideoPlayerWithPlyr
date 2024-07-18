const videoManager = {
    videoElement: null,
    videoUrl: null,
    player: null,
    /**
     * �񵿱� �Լ��� ���� ���� �÷��̾� �ʱ�ȭ
     * @param {string} videoElementId - ���� ����� id
     * @param {string} videoSrc - ���� ���/�ּ�
     * @param {Function} onEndCallback - ���� ��� ���� �� ������ �ݹ� �Լ�
     * @param {Array} controls - Plyr ��Ʈ�ѷ� ����
     * @param {Object} speed - ���� �ӵ� ���� { selected: ���õ� �ӿ�, options: [�ӵ� �ɼ�]}
     * @param {boolean} controllable - ���� ��Ʈ�� ���� ����
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
            console.error('Video element�� ã�� �� �����ϴ�.');
            return;
        }

        this.videoUrl = videoSrc;
        this.videoElement.controls = false;

        // ���� �ҽ��� ����
        this.setVideoSources();

        // Plyr ���̺귯���� �������� import
        const { default: Plyr } = await import('/library/plyr/plyr.min.js');
        
        this.setupPlyr(controls, speed, onEndCallback, controllable);
    },
    /**
     * Plyr �÷��̾� ����
     * @param {Array} controls - Plyr ��Ʈ�ѷ� ����
     * @param {Object} speed - ���� �ӵ� ���� { selected: ���õ� �ӵ�, options: [�ӵ� �ɼ�]}
     * @param {Function} onEndCallback - ���� ��� ���� �� ������ �ݹ� �Լ�
     * @param {boolean} controllable - ���� ��Ʈ�� ���� ����
     * @returns
     */
    setupPlyr: function (controls, speed, onEndCallback, controllable) {
        if (typeof Plyr === 'undefined') {
            console.error('Plyr ���̺귯���� �ε���� �ʾҽ��ϴ�.');
            return;
        }

        this.player = new Plyr(this.videoElement, {
            // controls�� null�̸� �⺻ ��Ʈ�ѷ� ���
            controls:  controls || ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        });

        // �⺻ �ӵ� ����
        this.player.on('ready', () => {
            this.player.speed = speed;
        });

        // controllable �Ű������� ���� ���� ��Ȱ��ȭ
        if (!controllable) {
            this.disableControls();
        }

        // ������ ������ �ݹ� �Լ� ����
        if (onEndCallback) {
            this.videoElement.addEventListener('ended', onEndCallback);
        }
    },
    /**
     * ���� ��Ʈ�� ��Ȱ��ȭ(���콺 ��Ŭ��, seek�� ����, Ű���� ��Ʈ�� ���� ��Ȱ��ȭ)
     */
    disableControls: function () {
        // ������ Ŭ�� �޴� ��Ȱ��ȭ
        this.videoElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // seek�� ���� ����
        const progress_bar = this.videoElement.closest('.plyr').querySelector('.plyr__progress__container');
        if (progress_bar) {
            progress_bar.style.pointerEvents = 'none';
            progress_bar.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
        }

        // Ű���� ��Ʈ�� ��Ȱ��ȭ
        this.player.config.keyboard = {
            focused: false,
            global: false
        };
    },
    /**
     * Ȯ���ڸ� ���� ���� ������ Ÿ���� ��ȯ
     * @param {string} url - ���� ������ URL(Ȯ���� ����)
     * @returns {string} - ���� ������ Ÿ��
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
        return mimeTypes[extension] || 'video/mp4'; // �⺻���� 'video/mp4'�� ����
    },
    /**
     * ���� �ҽ��� ���� (����� �ϳ��� ���� �ҽ��� �����ϸ�, �ʱ�ȭ�� �ڵ����� ���� ��)
     */
    setVideoSources: function () {
        // ���ο� �ҽ� ��� �߰�
        const sourceElement = document.createElement('source');
        sourceElement.src = this.videoUrl;
        /**
         * ���� ������ Ÿ���� ����
         * ����� html5���� �����ϴ� mp4, webm, ogg, wmv, avi�� �ڵ� ����
         */
        // sourceElement.type = this.getFileType(this.videoUrl);
        this.videoElement.appendChild(sourceElement);
    },
    /**
     * ���� ���
     */
    playVideo: function () {
        this.player.play();
    }
}
