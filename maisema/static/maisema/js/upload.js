'use strict';
console.log('upload.js')

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
            if (request.readyState === request.DONE) {
                // Calculate percentage
                this.uploadedFiles += 1;
                this.setProgress(this.getProgressPercentage(), `${this.uploadedFiles}/${this.totalFiles}`);
                if (request.status === 200) {
                    // Request successfully processed
                    console.log(request.response);
                    this.addFileStateError(request.response.file_fullpath, 'Something went terribly wrong! And this can potentially be a very long text+')
                    this.addFileStateSuccess(request.response.file_fullpath);
                } else {
                    // Something went wrong
                }
                if (this.uploadedFiles == this.totalFiles) {
                    console.log('DONE')
                    this.modalCloseButton.disabled = false;
                    //listing.innerHTML = "Uploading " + total + " file(s) is done!";
                    //loader.style.display = "none";
                    //loader.style.visibility = "hidden";
                }
            }
        }.bind(this);

        // Set post variables
        formData.set('file', file); // One object file
        formData.set('path', path); // String of local file's path

        // Do request
        var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value
        request.open("POST", '');
        request.setRequestHeader("X-CSRFToken", csrftoken);
        request.send(formData);
    }
}

/*

// Global variables
let picker = document.getElementById('picker');
let listing = document.getElementById('listing');
let box = document.getElementById('box');
let elem = document.getElementById("myBar");
let loader = document.getElementById("loader");
let counter = 1;
let total = 0;

var uploadProgressModal = $('#upload-progress-modal');

// On button input change (picker), process it
picker.addEventListener('change', e => {

    // show upload progress modal. Do not allow to dismiss with click outside.
    uploadProgressModal.modal({
        backdrop: 'static',
        keyboard: false
      })

    // Reset previous upload progress
    elem.style.width = "0px";
    listing.innerHTML = "None";

    // Get total of files in that folder
    total = picker.files.length;
    counter = 1;

    // Display image animation
    loader.style.display = "block";
    loader.style.visibility = "visible";

    // Process every single file
    for (var i = 0; i < picker.files.length; i++) {
        var file = picker.files[i];
        console.log(file)
        sendFile(file, file.webkitRelativePath);
    }
});


// Function to send a file, call PHP backend
function sendFile(file, path) {

    var item = document.createElement('li');
    var formData = new FormData();
    var request = new XMLHttpRequest();

    request.responseType = 'text';

    // HTTP onload handler
    request.onload = function() {
        if (request.readyState === request.DONE) {
            if (request.status === 200) {
                console.log(request.responseText);

                // Add file name to list


                listing.innerHTML = request.responseText + " (" + counter + " of " + total + " ) ";

                // Show percentage
                box.innerHTML = Math.min(counter / total * 100, 100).toFixed(2) + "%";

                // Show progress bar
                elem.innerHTML = Math.round(counter / total * 100, 100) + "%";
                elem.style.width = Math.round(counter / total * 100) + "%";

                // Increment counter
                counter = counter + 1;
            }
            if (counter >= total) {
                listing.innerHTML = "Uploading " + total + " file(s) is done!";
                loader.style.display = "none";
                loader.style.visibility = "hidden";
            }
        }
    };

    // Set post variables
    formData.set('file', file); // One object file
    formData.set('path', path); // String of local file's path

    // Do request
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value
    request.open("POST", '');
    request.setRequestHeader("X-CSRFToken", csrftoken);
    request.send(formData);

};

*/