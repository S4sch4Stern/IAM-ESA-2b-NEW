/**
 * @author Jörn Kreutel
 * @modifiziert von Alexander Thofern mittels Übungsdokument.pdf & tutorial.pdf
 */

import { GenericCRUDImplRemote, MyApplication as application, mwf } from "../Main.js";

export default class EditviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    viewProxy;
    mediaItem;

    constructor() {
        super();
        this.crudops = GenericCRUDImplRemote.newInstance("MediaItem");
        console.log("EditviewViewController()");
    }
    //xx
    /*
     * for any view: initialise the view
     */
    async oncreate() {
        //debugger;

        // TODO: do databinding, set listeners, initialise the view
        console.log(this.args);
        this.mediaItem = this.args.item;
        this.mediaItemBackup = JSON.parse(JSON.stringify(this.mediaItem));


        /* debuggen app
        this.viewProxy = this.bindElement(
            "mediaEditview", { item: this.mediaItem, app: application }, this.root
        ).viewProxy;
        */
       
        this.viewProxy = this.bindElement(
            "mediaEditview", { item: this.mediaItem, app: application }, this.root
        ).viewProxy;

        this.viewProxy.bindAction("deleteItem", (() => {
            this.deleteItem(this.mediaItem);
        }));

        this.viewProxy.bindAction("pasteDefaultURL", (() => {
            this.pasteDefaultURL(this.mediaItem);
        }));

        this.viewProxy.bindAction("refreshPreviewImage", (async (event) => {
            await this.getMediaType();

        }));

        const mediaEditviewForm = this.root.getElementsByTagName("form")[0];
        const srcfileInputElement = mediaEditviewForm.srcfile;

        if (this.mediaItem.mediaType == "video") {
            this.setVideoTime();
        }

        srcfileInputElement.onchange = () => {
            if (srcfileInputElement.files.length > 0) {
                const srcfileReference = srcfileInputElement.files[0];

                this.crudops.persistMediaContent(this.mediaItem, "src", srcfileReference).then(() => {
                    this.updateURL(this.mediaItem, this.mediaItem.src);
                });
            }
        }

        mediaEditviewForm.onsubmit = () => {
            this.updateOrCreateItem(this.mediaItem);

            if (this.mediaItem.mediaType == "video") {
                this.setVideoTime();
            }

            return false;
        }

        // call the superclass once creation is done
        
        super.oncreate();
    }

    // revert unconfirmed changes
    onback() {

        this.mediaItem.title = this.mediaItemBackup.title;
        this.mediaItem.src = this.mediaItemBackup.src;
        this.mediaItem.contentType = this.mediaItemBackup.contentType;
        this.mediaItem.description = this.mediaItemBackup.description;

        if (this.mediaItem.mediaType == "video") {
            this.root.getElementsByTagName("video")[0].pause();
            this.saveVideoTime();
        }

        this.previousView({updatedItem: this.mediaItem});
    }

    updateOrCreateItem(item) {
        if (item.created) {
            item.update().then(() => {
                this.previousView({ updatedItem: item });
            });
        } else {
            item.create().then(() => {
                this.previousView({ createdItem: item });
            });
        }
    }

    deleteItem(item) {
        item.delete().then(() => {
 
            this.previousView({ deletedItem: item });
        })
    }

    // update URL and associated fields in form
    updateURL(item, URL) {
        const srcfileUrl = URL;
        item.src = srcfileUrl;

        this.viewProxy.update({ item: item });

        mediaEditviewForm.urlfield.classList.add("mwf-material-filled", "mwf-material-valid");

        this.root.querySelector(".preview-image").src = item.src;
    }

    saveVideoTime(){

        let video = this.root.querySelector('#prevImageEdit');

        try {

            this.mediaItem.timestamp = video.currentTime;
            this.mediaItem.update().then(() => {
                console.log("Videotimestamp saved!");
            })
            
        } catch (error) {
            console.log("Kein Item vorhanden!");
        }
    }

    setVideoTime(){
        let video = this.root.querySelector('#prevImageEdit');

        video.currentTime = this.mediaItem.timestamp;
    }


    async getMediaType(){

        // Methode die von uns im Framework angespasst wurde
        this.crudops.loadMediaContent(this.mediaItem, "contentType").then((event) => {
            this.updateURL(this.mediaItem, this.mediaItem.src);
        });
        
    }

    pasteDefaultURL(item) {
        this.updateURL(item, "https://picsum.photos/200/200");
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

}

