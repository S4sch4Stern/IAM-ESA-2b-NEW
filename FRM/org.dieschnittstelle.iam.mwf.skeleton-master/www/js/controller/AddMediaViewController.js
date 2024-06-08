/**
 * @author Jörn Kreutel
 * 
 * Modifiziert im Pair Programming Verfahren durch: Benito Ernst, Arthur Muszynski
 */
import { GenericCRUDImplRemote, MyApplication as application, mwf } from "../Main.js";
import { entities } from "../Main.js";

export default class AddMediaViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    viewProxy;
    isEditMode;
    mediaItem;

    constructor() {
        super();
        this.isEditMode = false;
        this.crudops = GenericCRUDImplRemote.newInstance("MediaItem");
        console.log("AddMediaViewController()");
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view


        /*this.test.addEventListener('blur', function(event) {
            // Handle the blur event here
            console.log('Input blurred');
            console.log('Input value:', event.target.value);
        });*/


        this.mediaItem = this.args.item;
        var heading;
        var isLocal;

        if (application.currentCRUDScope == "local") {
            isLocal = true;	
        } else {
            isLocal = false;
        }


        if (this.mediaItem == null) {
            heading = "Neues Medium";
        } else {
            this.isEditMode = true;
            heading = "Editieren: " + this.mediaItem.title;
        }


        this.viewProxy = this.bindElement(
            "addMediaview", { item: { mediaItem: this.mediaItem, heading: heading, isEditMode: this.isEditMode, isLocal: isLocal} }, this.root
        ).viewProxy;

        this.viewProxy.bindAction("submitForm", (event => {
            event.original.preventDefault();

            if (this.isEditMode) {

                this.mediaItem.update().then(() => {
                    this.previousView({item: this.mediaItem});
                });


            } else {
                const formData = new FormData(this.root.querySelector("form"));

                const title = formData.get('title');
                const src = formData.get('src');
                const description = formData.get('description');

                const newMediaItem = new entities.MediaItem(title, src, description);

                console.log(newMediaItem);

                newMediaItem.create().then(() => {
                    this.isEditMode = true;
                    this.previousView({item: newMediaItem});
                    console.log(newMediaItem);
                });
            }
        }));

        console.log(application.currentCRUDScope);

        this.viewProxy.bindAction("pastDefaultUrl", (() => {

            let inputSrcElement = this.root.querySelector('#inputSrc');
            inputSrcElement.value = "TEst";
            inputSrcElement.classList.add("mwf-material-filled");
            inputSrcElement.classList.add("mwf-material-valid");
        }));

        this.viewProxy.bindAction("showFileUrl", ((event) => {

            var test = this.root.querySelector('#inputSrc');
            const test1 = this.root.querySelector('#imgPreview');

            console.log(event);

            const file = event.original.target.files[0];

            test.value = file.name;


            console.log(this);

            this.crudops.persistMediaContent(this.args.item, "img", file).then(() => {
                console.log("höhöhöh");
            });

            const reader = new FileReader();

            reader.onload = function(e) {
                const imageUrl = e.target.result;
                test1.src = imageUrl;
            };

            reader.readAsDataURL(file);
        }));

        this.viewProxy.bindAction("deleteItem", (() => {

            //      TODO

            /*
            mediaItem.delete().then(() => {
                this.previousView();
            })
            window.alert("Delete Item");
*/

        }));

        const inputSrcElement = this.root.querySelector('#inputSrc');
        const inputImgElement = this.root.querySelector('#imgPreview');


        if(inputImgElement != null){
            inputSrcElement.addEventListener('blur', function (event) {
                inputImgElement.src = inputSrcElement.value;
            });
        }
        

        // call the superclass once creation is done
        super.oncreate();
    }


    test(){
        console.log(this.crudops);
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

}

