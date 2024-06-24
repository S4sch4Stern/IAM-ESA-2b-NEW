/**
 * @author Jörn Kreutel
 * @modifiziert von Alexander Thofern mittels Übungsdokument.pdf & tutorial.pdf
 */
import { mwf } from "../Main.js";
import { entities } from "../Main.js";

export default class ReadviewViewController extends mwf.ViewController {
  // instance attributes set by mwf after instantiation
  args;
  root;
  // TODO-REPEATED: declare custom instance attributes for this controller
  viewProxy;

  constructor() {
    super();

    console.log("ViewControllerTemplate()");
  }

  /*
   * for any view: initialise the view
   */
  async oncreate() {
    // TODO: do databinding, set listeners, initialise the view
    //var mediaItem = this.args.item;
    // new entities.MediaItem("m","https://placekitten.com/300/400");
    //Benno
    // TODO: do databinding, set listeners, initialise the view
    this.mediaItem = this.args.item;
    //Benno

    this.viewProxy = this.bindElement(
      "mediaReadviewTemplate",
      {
        item: this.mediaItem,
      },
      this.root
    ).viewProxy;

    this.viewProxy.bindAction("mediaEditview", () => {
      this.nextView("mediaEditview", { item: this.mediaItem });
    });

    this.viewProxy.bindAction("deleteItem", () => {
      this.mediaItem.delete().then(() => {
        this.previousView({ deletedItem: this.mediaItem });
      });
    });

    // call the superclass once creation is done
    super.oncreate();
  }

  //benno
  onback() {
    if (this.updatedItem) this.previousView({ updatedItem: this.updatedItem });
    else super.onback();

    if (this.mediaItem.mediaType == "video") {
      this.root.getElementsByTagName("video")[0].pause();
      this.saveVideoTime();
    }
  }


  saveVideoTime(){

    let video = this.root.querySelector('#prevImageRead');

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
    let video = this.root.querySelector('#prevImageRead');

    video.currentTime = this.mediaItem.timestamp;
}


  //benno


  /*
   * for views that initiate transitions to other views
   * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
   */

  async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
    debugger;
    if (
      nextviewid == "mediaEditview" &&
      returnValue &&
      returnValue.deletedItem
    ) {
      this.previousView({ deletedItem: returnValue.deletedItem });
      // return false - Rückkehr in die Listview "mediaOverview"
      return false;
    }

    if (
      nextviewid == "mediaEditview" &&
      returnValue &&
      returnValue.updateInListview
    ) {
      this.updateInListview(
        returnValue.updatedItem._id,
        returnValue.updatedItem
      );
    }
    console.log("test");
    console.log(this);
    console.log(this.viewProxy);
    console.log(this.updatedItem);
    // mittels ViewProxy mediaitem updaten
    this.viewProxy.update({ item: returnValue.updatedItem }); // ohne diesen Teil erfolgt keine update Sicht in der Readview
    console.log(this.viewProxy);

    // Übergabe des geupdateten mediaitems an den ReadviewViewController zur korrekten Anzeige nachdem updaten
    this.updatedItem = returnValue.updatedItem; // ohne diesen Teil gibt es Fehler weil das MediaItem undefined ist
    console.log(this.updatedItem);
  }



  /*
   * for views with listviews: bind a list item to an item view
   * TODO: delete if no listview is used or if databinding uses ractive templates
   */
  bindListItemView(listviewid, itemview, itemobj) {
    // TODO: implement how attributes of itemobj shall be displayed in itemview
    console.log("im here bindListItemView");
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

}
