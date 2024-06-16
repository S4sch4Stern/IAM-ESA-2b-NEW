


import {mwf} from "../Main.js";
import {entities} from "../Main.js";

export default class EditViewController extends mwf.ViewController {
    setURL;
    default;

    async oncreate() {

        const mediaItem = this.args ? this.args.item : undefined;
        const viewProxy = this.bindElement("mediaItemEditViewTemplate", {item: mediaItem}, this.root).viewProxy;

        viewProxy.bindAction("deleteItem",(() => {
            mediaItem.delete().then(() => {
                this.notifyListeners(new mwf.Event("crud","deleted","MediaItem",mediaItem._id));
                this.root.querySelector("#previewVideo").pause();
                this.previousView("mediaOverview");
            })
        }));

        this.setURL = this.root.querySelector("#defaulturl");
        this.default =this.root.querySelector("#default");
        this.setURL.onclick = (() =>{
            const form= this.root.querySelector("#mediaItemEdit");
            const img =this.root.querySelector("#previewImage");
            /*form.src.value ="https://placekitten.com/100/100";*/
            form.src.value ="https://placehold.co/100x100";
            this.default.classList.add("mwf-material-filled");
            /*img.src="https://placekitten.com/100/100";*/
           
            img.src="https://placehold.co/100x100";
        });

        const src = this.root.querySelector("#src");
        src.onkeyup = (() => {
            this.validateURL()
        });

        viewProxy.bindAction("submitEditForm",((event) =>{
            event.original.preventDefault();

            if (!this.validateURL()) {
                return false;
            }
            this.root.querySelector("#previewVideo").pause();
            const form = event.original.target;

            // upload to server
            if(form.srcinput.files[0]) {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append("src", form.srcinput.files[0]);

                xhr.onreadystatechange = () => {
                    if(xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            const jsonRESPONSE = JSON.parse(xhr.responseText).data;

                            if (mediaItem){
                                mediaItem.src = jsonRESPONSE.src;
                                mediaItem.contentType = jsonRESPONSE.contentType;
                                mediaItem.update();
                            } else {
                                form.src.value = jsonRESPONSE.src;
                                form.contentType.value = jsonRESPONSE.contentType;
                                this.addNewItem(form);
                            }

                            // reset inputs
                            form.reset();
                            this.previousView({item: mediaItem});

                        } else {
                            console.log("Es ist etwas Schief gelaufen: " + xhr.status);
                        }
                    }
                }

                xhr.open("POST", "api/content/formdata");
                xhr.send(formData);

                // existing mediaItem update or create new one
            } else {
                if (mediaItem){
                    mediaItem.update();
                } else {
                    this.addNewItem(form);
                }

                form.reset();
                this.previousView({item: mediaItem});
            }
        }));
        const altInput = this.root.querySelector("#altinput");

        // Disable alternative file input if scope is local
        if( this.application.currentCRUDScope ==="local") {
            this.root.querySelector("#altlabel").classList.add("disabled");
            altInput.disabled= true;
        }
        // adding onchange event Listener for selecting images via alternative file input
        altInput.onchange = ((event) => {
            const url = URL.createObjectURL(event.target.files[0]);
            const contentType = event.target.files[0].type;

            if (mediaItem) {
                mediaItem.src = url;
                mediaItem.contentType = event.target.files[0].type;
                viewProxy.update({ item: mediaItem });

            } else {
                const form= this.root.querySelector("#mediaItemEdit");
                const previewImage= this.root.querySelector("#previewImage");
                const previewVideo = this.root.querySelector("#previewVideo");

                if (contentType.startsWith("video/")) {
                    previewImage.hidden= true;
                    previewVideo.hidden = false;
                    previewVideo.src = url;
                } else {
                    previewImage.hidden= false;
                    previewVideo.hidden = true;
                    previewImage.src = url;
                }
                form.src.value = url;
            }
            
            this.validateURL();
            

        });

        // call the superclass once creation is done
        super.oncreate();
    }
    /*
    *   create a new MediaItem using the form
    *
    *   @param src          value of url or filename
    *   @param contentType  holds the contentType of used src (video or image)
    *   @param title        the title of the item
    *   @param description  the description of the item
    *
    **/
    addNewItem(form) {
        const src = form.src.value;
        const contentType = form.contentType.value;
        const title = form.title.value;
        const description = form.description.value;

        const mediaItem = new entities.MediaItem(title, src, description, contentType);
        mediaItem.create();

        
    }
    /*
    *   checks if the Url was valid using isURLValid()
    *
    **/
   
    validateURL() {
      const form = this.root.querySelector("#mediaItemEdit");
      const img = this.root.querySelector("#previewImage");

      // removes spaces
      form.src.value = form.src.value.replace(/\s+/g,"");
      img.src = form.src.value.replace(/\s+/g,"");

      if (form.src.value.length != 0 && !this.isURLValid(form.src.value)){
          form.src.classList.add("invalid");
          this.root.querySelector("#url").classList.add("invalid");
          return false;
      } else {
          form.src.classList.remove("invalid");
          this.root.querySelector("#url").classList.remove("invalid");
          return true;
      }
    }
    /*
    *    validate the url before a new MediaItem can be created
    *
    *   @param regex  describes a pattern the url has to follow for it to be validated
    */
   
    isURLValid(url) {
       const regex = /^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;

        if (url.startsWith("blob:")) {
            return true;
        } else if (url.startsWith("content/")) {
            return true;
        } else if (regex.test(url)) {
            return true;
        } else {
            return false;
        }
    }
        

}