/*\
title: $:/plugins/anicolao/tw5-firestore-sync/firestoreadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising with the user's own firestore instance.

\*/

import { deleteTiddler, initialLoadComplete, loadTiddler, registerSyncCallback, storeTiddler } from "./firebase";
// rome-ignore lint/suspicious/noExplicitAny: no types for tw yet
declare var $tw: any;
declare var exports: any;
(function () {
	function FirestoreAdaptor(options: { wiki: unknown; boot: unknown }) {
		var self = this;
		self.wiki = options.wiki;
		self.boot = options.boot || $tw.boot;
		self.logger = new $tw.utils.Logger("firestore", { colour: "red" });
	}
	FirestoreAdaptor.prototype.name = "firestore";
	FirestoreAdaptor.prototype.supportsLazyLoading = false;
	FirestoreAdaptor.prototype.isReady = function () {
		const ret = initialLoadComplete();
		this.logger.log(`isReady: ${ret}`);
		return true;
	};
	let idCounter = 100;
	FirestoreAdaptor.prototype.getTiddlerInfo = function (tiddler: {
		fields: { title: string };
	}) {
		const tiddlerclone = tiddler.fields.title;
		this.logger.log(`getTiddlerInfo ${JSON.stringify(tiddlerclone)}`);
		return { id: ++idCounter };
	};
	let registered = false;
	FirestoreAdaptor.prototype.getUpdatedTiddlers = function (
		_syncer: unknown,
		callback: (arg0: null, arg1: { modifications: string[]; deletions: string[]; }) => void,
	) {
		if (!registered) {
			registered = true;
			if (typeof window !== "undefined") {
				registerSyncCallback(callback);
			}
			this.logger.log("getUpdatedTiddlers");
		} else {
			this.logger.log("getUpdatedTiddlers ignored, already registered");
		}
	};
	FirestoreAdaptor.prototype.saveTiddler = function (
		tiddler: {
			title: string;
			getFieldStrings: (arg0: { exclude: string[] }) => unknown;
		},
		callback: (arg0: unknown, arg1: unknown) => void,
		options: unknown,
	) {
		const data: { title: string } = tiddler.getFieldStrings({
			exclude: ["bag"],
		}) as { title: string };

		this.logger.log(
			`saveTiddler ${JSON.stringify(tiddler)} with ${JSON.stringify(options)}`,
		);
		// hack to avoid calling storeTiddler at build time
		if (typeof window !== "undefined" && initialLoadComplete()) {
			storeTiddler(data.title, data);
		}
		callback(null, null);
	};
	FirestoreAdaptor.prototype.loadTiddler = function (
		title: string,
		callback: (arg0: unknown, arg1: unknown) => void,
	) {
		this.logger.log(`loadTiddler ${JSON.stringify(title)}`);
		if (typeof window !== "undefined") {
			loadTiddler(title, callback);
		}
	};
	FirestoreAdaptor.prototype.deleteTiddler = function (
		title: string,
		callback: (arg0: unknown, arg1: unknown) => void,
		options: unknown,
	) {
		this.logger.log(`deleteTiddler ${JSON.stringify(title)}`);
		if (typeof window !== "undefined") {
			deleteTiddler(title);
		}
		callback(null, null);
	};
	exports.adaptorClass = FirestoreAdaptor;
})();
