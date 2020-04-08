'use strict';
console.log('upload.js')

/*
Shoutout to https://github.com/komputronika/UploadFolder for the inspiration!
*/

$(document).ready(function() {
    var modal = new UploadProgressModal({
        modalId: 'upload-progress-modal',
        fileUploadId: 'picker'
    });
});

class UploadProgressModal {
    constructor(conf) {
        this.modal = document.querySelector('#' + conf['modalId']);
        this.fileUpload = document.querySelector('#' + conf['fileUploadId']);
        this.modalCloseButton = this.modal.querySelector('.modal-close-btn');
        this.progressBar = this.modal.querySelector('.progress-bar');
        this.fileStateContainer = this.modal.querySelector('.file-state-container');

        this.uploadedFiles = null;
        this.totalFiles = null;

        this.fileUpload.addEventListener('change', this.initFileUpload.bind(this));
        this.modalCloseButton.addEventListener('click', function() {
            location.reload(); // reload page to refresh browser with new data
        })
    }

    async initFileUpload(e) {
        this.modalCloseButton.disabled = true; // Disable modal close button until upload has fininshed
        $(this.fileStateContainer).empty();
        this.setProgress(0, '');
        this.showModal();

        // Process every selected file
        this.uploadedFiles = 0;
        this.totalFiles = this.fileUpload.files.length;
        this.setProgress(0, `0/${this.totalFiles}`);
        for (var i = 0; i < this.totalFiles; i++) {
            var file = this.fileUpload.files[i];
            this.sendFile(file, file.webkitRelativePath);
            await new Promise(r => setTimeout(r, 500));
        }
    }

    addFileStateSuccess(filename) {
        let template = `
        <div class="alert alert-success d-flex align-items-center">
            <small class="flex-grow-1">${filename}</small>
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>`
        $(template).hide().appendTo(this.fileStateContainer).fadeIn();
    }

    addFileStateError(filename, error) {
        let template = `
        <div class="alert alert-danger d-flex align-items-center">
            <small class="flex-grow-1">${filename}</small>
            <button type="button" class="btn btn-danger btn-sm" data-container="body" data-toggle="popover" data-placement="top" data-content="${error}">
                See error
            </button>
            <button type="button" class="ml-3 close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>`
        let message = $(template);
        message.find('button[data-toggle="popover"]').popover(); // Popovers must be explicitly initialized.
        message.hide().appendTo(this.fileStateContainer).fadeIn();
    }

    showModal() {
        // show upload progress modal. Do not allow to dismiss with click outside.
        $(this.modal).modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    setProgress(percentage, label) {
        this.progressBar.style.width = percentage.toString() + '%';
        this.progressBar.innerHTML = label;
    }

    getProgressPercentage() {
        return Math.round(Math.min(this.uploadedFiles / this.totalFiles * 100, 100));
    }

    sendFile(file, path) {

        var formData = new FormData();
        var request = new XMLHttpRequest();
        request.responseType = 'json';

        // HTTP onload handler
        request.onload = function() {
            console.log(request.readyState)
            if (request.readyState === request.DONE) {
                // Calculate percentage
                this.uploadedFiles += 1;
                this.setProgress(this.getProgressPercentage(), `${this.uploadedFiles}/${this.totalFiles}`);
                console.log(request.status)
                console.log(request)
                if (request.status === 200) {
                    // Request successfully processed
                    console.log('SUCCES')
                    console.log(request.response);
                    this.addFileStateSuccess(request.response.file_fullpath);
                } else {
                    console.log('ERROR');
                    this.addFileStateError('Oh no, something went wrong!', `Status code: ${request.status} | Error message: ${request.statusText}`)
                }
                if (this.uploadedFiles == this.totalFiles) {
                    console.log('DONE')
                    this.modalCloseButton.disabled = false;
                }
            }
        }.bind(this);

        // Set post variables
        formData.set('file', file); // One object file
        formData.set('path', path); // String of local file's path

        // Do request
        var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value
        request.open("POST", '');
        //if (Math.random()<0.5) {
        request.setRequestHeader("X-CSRFToken", csrftoken);
        //}
        request.send(formData);
    }
}